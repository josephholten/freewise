# freewise

## build & host locally

```bash
docker-compose up -d --build
```

then it is available under `localhost:3000`


## seeding

To insert some default data for development, run

```bash
docker-compose exec freewise npx prisma db seed
```

this will run the script `prisma/seed.ts`