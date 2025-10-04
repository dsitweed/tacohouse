# Quick note 
- Không được để quick note dài quá 20 dòng
Dùng pnpm cho cả 2 bên FE và BE
```bash
pnpm add @nestjs/typeorm typeorm pg
```
TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'simform',
      username: 'postgres',
      entities: [],
      database: 'pgWithNest',
      synchronize: true,
      logging: true,
    }),
    UserModule,
  ],

nest g res user
