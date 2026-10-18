# Viverasmus

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Run with Docker

Build and start the production app with Docker Compose:

```sh
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). Angular routes are served through the app shell, so direct links and page refreshes work. Stop the container with `Ctrl+C`, or run `docker compose down` from another terminal.

To build and run the image without Compose:

```sh
docker build -t viverasmus .
docker run --rm -p 8080:80 viverasmus
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
