package org.viverasmus.api.faqs;

import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FaqService {
    private final JdbcTemplate jdbc;

    public FaqService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<FaqItem> findPublished() { return find(false); }
    public List<FaqItem> findAll() { return find(true); }

    private List<FaqItem> find(boolean includeUnpublished) {
        String sql = "SELECT id, question, answer, position, published FROM faq_items "
                + (includeUnpublished ? "" : "WHERE published = TRUE ") + "ORDER BY position, id";
        return jdbc.query(sql, (rs, row) -> new FaqItem(rs.getString("id"), rs.getString("question"),
                rs.getString("answer"), rs.getInt("position"), rs.getBoolean("published")));
    }

    @Transactional
    public FaqItem create(FaqRequest request) {
        validate(request);
        int position = jdbc.queryForObject("SELECT COALESCE(MAX(position) + 1, 0) FROM faq_items", Integer.class);
        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO faq_items (id, question, answer, position, published) VALUES (?, ?, ?, ?, ?)",
                id, request.question().trim(), request.answer().trim(), position, request.published());
        return new FaqItem(id, request.question().trim(), request.answer().trim(), position, request.published());
    }

    public boolean update(String id, FaqRequest request) {
        validate(request);
        return jdbc.update("UPDATE faq_items SET question = ?, answer = ?, published = ? WHERE id = ?",
                request.question().trim(), request.answer().trim(), request.published(), id) > 0;
    }

    @Transactional
    public boolean delete(String id) {
        if (jdbc.update("DELETE FROM faq_items WHERE id = ?", id) == 0) return false;
        List<String> remaining = jdbc.query("SELECT id FROM faq_items ORDER BY position, id",
                (rs, row) -> rs.getString(1));
        for (int i = 0; i < remaining.size(); i++) jdbc.update("UPDATE faq_items SET position = ? WHERE id = ?", i, remaining.get(i));
        return true;
    }

    @Transactional
    public boolean reorder(List<String> ids) {
        List<String> actual = jdbc.query("SELECT id FROM faq_items ORDER BY position, id", (rs, row) -> rs.getString(1));
        if (ids == null || ids.size() != actual.size() || !ids.containsAll(actual) || !actual.containsAll(ids)) return false;
        for (int i = 0; i < ids.size(); i++) jdbc.update("UPDATE faq_items SET position = ? WHERE id = ?", i, ids.get(i));
        return true;
    }

    private void validate(FaqRequest request) {
        if (request == null || request.question() == null || request.question().isBlank()
                || request.question().trim().length() > 500 || request.answer() == null || request.answer().isBlank())
            throw new IllegalArgumentException("Enter a question (up to 500 characters) and an answer.");
    }

    public record FaqItem(String id, String question, String answer, int position, boolean published) {}
    public record FaqRequest(String question, String answer, boolean published) {}
    public record ReorderRequest(List<String> ids) {}
}
