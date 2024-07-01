import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { getDatabaseConfig } from "./config";
import { UserModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentModule } from "./payments/payments.module";
import { SubscriptionModule } from "./subscriptions/subscriptions.module";
import { TalentModule } from "./talents/talents.module";
const dbConfig = getDatabaseConfig();

@Module({
  imports: [
    MongooseModule.forRoot(`${dbConfig.url}`, {}),
    UserModule,
    AuthModule,
    PaymentModule,
    SubscriptionModule,
    TalentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
