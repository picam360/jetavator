#include <HX711.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>

const char* ssid = "your-ssid";
const char* password = "*****";
const IPAddress ip(192,168,0,100);
const IPAddress gateway(192,168,0,1);
const IPAddress subnet(255,255,255,0);

AsyncWebServer server(80);

HX711 scale;
float weight = 0.0;

void setup() {
  Serial.begin(9600);
  scale.begin(SDA, SCL);
  scale.set_scale(2280.f);  // この値はあなたのロードセルによって異なるかもしれません。適切な値に調整する必要があります。
  scale.tare(); // スケールをゼロにリセットします

  // Cofloat weightnnect to Wi-Fi
  if (!WiFi.config(ip, gateway, subnet)){
    Serial.println("Failed to configure!");
  }
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Handle Web Server
  server.on("/info.json", HTTP_GET, [](AsyncWebServerRequest *request){
    char buffer[64];
    sprintf(buffer, "{weight:%f}", weight);
    request->send(200, "text/plain", buffer);
  });

  // Start server
  server.begin();
}

void loop() {
  Serial.print("Reading: ");
  weight = scale.get_units(5); // 5回の読み取りの平均を取ります。この値もあなたの必要に応じて調整することができます。
  Serial.println(weight);
  delay(1000);
}





