import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getServerConfig } from "./config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix("api");
  app.use('/api/payment/webhook', bodyParser.raw({type: 'application/json'}));
  const serverConfig = getServerConfig();

  const config = new DocumentBuilder()
    .setTitle("Talent Infusion Api")
    .setDescription("This is Talent Infusion api")
    .setVersion("1.0")
    .addTag("Talent Infusion")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(serverConfig.port, serverConfig.host, () => {
    console.info(
      `Listening at http://${serverConfig.host}:${serverConfig.port}/`
    );
  });
}
bootstrap();
