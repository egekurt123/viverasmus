package org.viverasmus.api.photos;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {
    private final PhotoStorageService storage;

    public PhotoController(PhotoStorageService storage) {
        this.storage = storage;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PhotoUploadResponse upload(@RequestParam("file") MultipartFile file,
                                      @RequestParam("propertyName") String propertyName,
                                      @RequestParam(value = "roomNumber", required = false) Integer roomNumber) {
        try {
            PhotoStorageService.StoredPhoto photo = storage.save(file, propertyName, roomNumber);
            String url = "/api/photos/files/"
                    + encode(photo.propertyFolder()) + "/"
                    + encode(photo.photoFolder()) + "/"
                    + encode(photo.filename());
            return new PhotoUploadResponse(photo.relativePath(), url);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save photo.");
        }
    }

    @GetMapping("/files/{property}/{group}/{filename}")
    public ResponseEntity<Resource> getApartmentPhoto(@PathVariable String property,
                                                      @PathVariable String group,
                                                      @PathVariable String filename) {
        try {
            Path photo = storage.pathForApartmentPhoto(property, group, filename);
            if (!java.nio.file.Files.isRegularFile(photo)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found.");
            }
            return ResponseEntity.ok()
                    .contentType(storage.contentTypeForApartmentPhoto(filename))
                    .cacheControl(CacheControl.noCache())
                    .body(new FileSystemResource(photo));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> get(@PathVariable String id) {
        Path photo = pathForRequest(id);
        if (!java.nio.file.Files.isRegularFile(photo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found.");
        }
        MediaType contentType = storage.contentTypeFor(id);
        return ResponseEntity.ok()
                .contentType(contentType)
                .cacheControl(CacheControl.noCache())
                .body(new FileSystemResource(photo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            storage.delete(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete photo.");
        }
    }

    @DeleteMapping("/files/{property}/{group}/{filename}")
    public ResponseEntity<Void> deleteApartmentPhoto(@PathVariable String property,
                                                     @PathVariable String group,
                                                     @PathVariable String filename) {
        try {
            storage.deleteApartmentPhoto(property, group, filename);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not delete photo.");
        }
    }

    private String encode(String pathSegment) {
        return UriUtils.encodePathSegment(pathSegment, StandardCharsets.UTF_8);
    }

    private Path pathForRequest(String id) {
        try {
            return storage.pathFor(id);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    public record PhotoUploadResponse(String id, URI url) {
        public PhotoUploadResponse(String id, String url) {
            this(id, URI.create(url));
        }
    }
}
