# Backend

This repo contains the backend api, the data storage using Lowdb and
the static hosting of the images using multer. Swagger configuration
can be found but it is not finished.

## API and Lowdb Initialization

The [index](./src/index.mjs) is the entrypoint of the app, at its beginning
the Express api is initialized then the LowDb. There is
a helper function in [utils](./src/utils.js) that checks
if the db.json exists and if it already contains the data
found in the .js file found in data/. If not it creates it
and seeds the database with the arrays from the js files.

Then the endpoints are implemented. To avoid code douplication
endpoint [actions](./src/actions.js) and [utility functions](./src/utils.js) where moved
to different files.

For example the backend auto assigns new processes to the least busy
technicians and randomly assigns type of warranty to newly created
devices. These functions where moved to utils.js.

## Multer

[Multer](./src/multer.js) is a package that allows us to statically
host the [image directory](./src/data/photos/)

## Swagger

To [see](./src/swagger.mjs)(and use) the available endpoints, while the containers
are running, visit:

```url
http://localhost:3000/docs
```
