package org.viverasmus.api.faqs;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.viverasmus.api.tenants.AdminAuthService;

@RestController
@RequestMapping("/api")
public class FaqController {
    private final FaqService faqs;
    private final AdminAuthService admins;

    public FaqController(FaqService faqs, AdminAuthService admins) { this.faqs = faqs; this.admins = admins; }

    @GetMapping("/faqs")
    public List<FaqService.FaqItem> getPublished() { return faqs.findPublished(); }

    @GetMapping("/admin/faqs")
    public List<FaqService.FaqItem> getAll(@RequestHeader(value = "Authorization", required = false) String authorization) {
        requireAdmin(authorization);
        return faqs.findAll();
    }

    @PostMapping("/admin/faqs")
    public FaqService.FaqItem create(@RequestBody FaqService.FaqRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        requireAdmin(authorization);
        try { return faqs.create(request); }
        catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PutMapping("/admin/faqs/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody FaqService.FaqRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        requireAdmin(authorization);
        try {
            if (!faqs.update(id, request)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ not found.");
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @DeleteMapping("/admin/faqs/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        requireAdmin(authorization);
        if (!faqs.delete(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ not found.");
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/admin/faqs/order")
    public ResponseEntity<Void> reorder(@RequestBody FaqService.ReorderRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        requireAdmin(authorization);
        if (!faqs.reorder(request.ids())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FAQ order is invalid.");
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(String authorization) {
        if (!admins.isValid(authorization)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin login required.");
    }
}
