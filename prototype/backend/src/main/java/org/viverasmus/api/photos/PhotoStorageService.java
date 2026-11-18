package org.viverasmus.api.photos;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.Map;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PhotoStorageService {
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif",
            "image/webp", ".webp");
    private static final Map<String, String> CONTENT_TYPES = Map.of(
            ".jpg", "image/jpeg",
            ".png", "image/png",
            ".gif", "image/gif",
            ".webp", "image/webp");

    private final Path uploadDirectory;

    public PhotoStorageService(@Value("${viverasmus.upload-dir:./uploads}") String uploadDirectory)
            throws IOException {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDirectory);
    }

    public synchronized StoredPhoto save(MultipartFile file, String propertyName, Integer roomNumber) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Choose a photo to upload.");
        }
        if (file.getSize() > 15L * 1024 * 1024) {
            throw new IllegalArgumentException("Photos must be 15 MB or smaller.");
        }

        String extension = EXTENSIONS.get(file.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("Use a JPG, PNG, GIF or WebP photo.");
        }

        String propertyFolder = safePropertyFolder(propertyName);
        String photoFolder = roomNumber == null ? "ZONA COMUNES" : roomFolder(roomNumber);
        String prefix = roomNumber == null ? "COMUN" : "HAB" + roomNumber;
        Path directory = uploadDirectory.resolve(propertyFolder).resolve(photoFolder).normalize();
        if (!directory.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid photo folder.");
        }
        Files.createDirectories(directory);

        int sequence = 1;
        String filename;
        do {
            filename = prefix + "-" + sequence++ + extension;
        } while (Files.exists(directory.resolve(filename)));

        try (var input = file.getInputStream()) {
            Files.copy(input, directory.resolve(filename));
        }
        return new StoredPhoto(propertyFolder, photoFolder, filename);
    }

    public Path pathFor(String id) {
        if (id == null || !id.matches("[0-9a-fA-F-]{36}\\.(jpg|png|gif|webp)")) {
            throw new IllegalArgumentException("Invalid photo id.");
        }
        Path photo = uploadDirectory.resolve(id).normalize();
        if (!photo.getParent().equals(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid photo id.");
        }
        return photo;
    }

    public org.springframework.http.MediaType contentTypeFor(String id) {
        String extension = id.substring(id.lastIndexOf('.'));
        return mediaTypeForExtension(extension);
    }

    public Path pathForApartmentPhoto(String property, String group, String filename) {
        validateSegment(property);
        validateSegment(group);
        validateSegment(filename);
        String extension = filename.substring(filename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        if (!CONTENT_TYPES.containsKey(extension)) {
            throw new IllegalArgumentException("Unsupported photo type.");
        }
        Path photo = uploadDirectory.resolve(property).resolve(group).resolve(filename).normalize();
        if (!photo.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid photo path.");
        }
        return photo;
    }

    public org.springframework.http.MediaType contentTypeForApartmentPhoto(String filename) {
        return mediaTypeForExtension(filename.substring(filename.lastIndexOf('.')));
    }

    public void deleteApartmentPhoto(String property, String group, String filename) throws IOException {
        Files.deleteIfExists(pathForApartmentPhoto(property, group, filename));
    }

    private org.springframework.http.MediaType mediaTypeForExtension(String extension) {
        String contentType = CONTENT_TYPES.get(extension.toLowerCase(Locale.ROOT));
        if (contentType == null) throw new IllegalArgumentException("Unsupported photo type.");
        return org.springframework.http.MediaType.parseMediaType(contentType);
    }

    private String safePropertyFolder(String propertyName) {
        if (propertyName == null || propertyName.isBlank()) {
            throw new IllegalArgumentException("Enter the flat name before uploading photos.");
        }
        String folder = Normalizer.normalize(propertyName.trim(), Normalizer.Form.NFC)
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}-]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (folder.isEmpty() || folder.length() > 80) {
            throw new IllegalArgumentException("The flat name cannot be used as a photo folder.");
        }
        return folder;
    }

    private String roomFolder(Integer roomNumber) {
        if (roomNumber < 1 || roomNumber > 20) {
            throw new IllegalArgumentException("Room number must be between 1 and 20.");
        }
        return "HAB" + roomNumber;
    }

    private void validateSegment(String segment) {
        if (segment == null || segment.isBlank() || segment.equals(".") || segment.equals("..")
                || !segment.matches("[\\p{L}\\p{N} _().-]+")) {
            throw new IllegalArgumentException("Invalid photo path.");
        }
    }

    public void delete(String id) throws IOException {
        Files.deleteIfExists(pathFor(id));
    }

    public record StoredPhoto(String propertyFolder, String photoFolder, String filename) {
        public String relativePath() {
            return propertyFolder + "/" + photoFolder + "/" + filename;
        }
    }
}
