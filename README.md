# polydraw

A collaborative online geo-data editing tool!

## How it works

* A backend application written in [NestJS](https://www.nestjs.com/)
* A frontend application written in [Vue](https://vuejs.org)
* Each user has a session opened in the backend, and each of their action is broadcast 
  and synchronized in a central state
* All users see (approximately) the same thing and can edit objects concurrently!

## Instructions

To start the application:

```shell
$ npm install
$ npm run start
```

And then open http://localhost:3000.

## Reference

As you may have noticed, this is super similar to https://www.placemark.io/, albeit vastly less powerful. At least it's open source ¯\\\_(ツ)_/¯
