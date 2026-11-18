# Viverasmus

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Run with Docker

Build and start the Angular app and Spring Boot photo API with Docker Compose:

```sh
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). Angular routes are served through the app shell, so direct links and page refreshes work. PostgreSQL is available on `localhost:5432` with database/user `viverasmus`. Copy `.env.example` to `.env` and change `POSTGRES_PASSWORD` to set a local password. The database survives `docker compose down`; `docker compose down -v` removes its data volume. Stop the containers with `Ctrl+C`, or run `docker compose down` from another terminal.

Apartment photos are kept as regular files in `prototype/apartment-photos/`, organized by property, room, and shared-space folders. Existing listing photos are served from this folder through `/api/photos/files/...`. New uploads use uppercase property folders, room folders such as `HAB1/` with names like `HAB1-1.jpg`, and `ZONA COMUNES/COMUN-1.jpg` for flat photos. The upload API accepts JPG, PNG, GIF, and WebP files up to 15 MB. Listing data itself still lives in browser local storage.

If you already have uploads in the previous Docker storage, copy them into the new photo folder before recreating the containers:

```sh
docker compose cp backend:/data/uploads/. ./apartment-photos/
docker compose up -d --build
```

For local development, start the backend first:

```sh
docker compose up -d db
cd backend
mvn spring-boot:run
```

Then, in another terminal, start Angular from `prototype` with `npm start`. Angular's dev-server proxy forwards `/api` requests to the backend at `localhost:8081`.

The backend connects to PostgreSQL through Spring Data JPA, and Hibernate is configured to create/update tables when entities are added. The current API still covers photo upload, retrieval, and deletion; listings, room edits, and the demo login continue to use the existing browser-side mock/local-storage implementation. The photo endpoints do not yet require authentication, so add Spring Security before exposing this prototype publicly.

To build and run the image without Compose:

```sh
docker build -t viverasmus .
docker run --rm -p 8080:80 viverasmus
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
