#include "config.h"

#include <HX711.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ESP32Servo.h>

#ifdef TARGET_DEVICE_ATOMS3
#include <M5AtomS3.h>     // ATOMS3用ライブラリ
#define SDA_PIN 2
#define SCL_PIN 1
#define SERVO_PIN 38
#elif TARGET_DEVICE_ESP_DEVKIT_C
#define SDA_PIN SDA
#define SCL_PIN SCL
#define SERVO_PIN 38
#endif

AsyncWebServer server(80);

HX711 scale;
Servo servo;
float weight = 0.0;
float angle = BASE_ANGLE;
int pulse = (MAX_PULSE + MIN_PULSE) / 2;

int reset_state = 0;

int get_pulse(float a){
  float val = (a - MIN_ANGLE) * (MAX_PULSE - MIN_PULSE) / (MAX_ANGLE - MIN_ANGLE) + MIN_PULSE;
  if(val > MAX_PULSE){
    val = MAX_PULSE;
  }
  if(val < MIN_PULSE){
    val = MIN_PULSE;
  }
  return (int)round(val);
}

bool isNumeric(String str) {
  for (char c : str) {
    if (!isDigit(c) && c != '.' && c != '-') {
      return false;
    }
  }
  return true;
}

void setup() {
#ifdef TARGET_DEVICE_ATOMS3
  M5.begin(true, false, true, false); // AtomS3初期設定（LCD,UART,I2C,LED）
  M5.Lcd.begin();                   // 画面初期化
  M5.Lcd.setRotation(2);            // 画面向き設定（USB位置基準 0：上/ 1：左/ 2：下/ 3：右）
  M5.Lcd.fillScreen(BLACK);         // 背景
#endif

  Serial.begin(9600);
  Serial.println("Start");

  scale.begin(SDA_PIN, SCL_PIN);
  scale.set_scale(2280.f);  // この値はあなたのロードセルによって異なるかもしれません。適切な値に調整する必要があります。
  scale.tare(); // スケールをゼロにリセットします

  servo.setPeriodHertz(50);      // Standard 50hz servo
  servo.attach(SERVO_PIN, MIN_PULSE, MAX_PULSE);

  // Connect to Wi-Fi
#ifdef USE_STATIC_IP
  if (!WiFi.config(ip, gateway, subnet)){
    Serial.println("Failed to configure!");
  }
#endif
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.println(WiFi.localIP());

  // Handle Web Server
  server.on("/info.json", HTTP_GET, [](AsyncWebServerRequest *request){
    char buffer[256] = {};
    sprintf(buffer, "{\"score\":%.3f,\"weight\":%.3f,\"angle\":%.3f,\"pulse\":%d}", weight, weight, angle, pulse);
    request->send(200, "text/plain", buffer);
  });
  server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    reset_state = 1;
    request->send(200, "text/plain", "OK");
  });
  server.on("/tare", HTTP_GET, [](AsyncWebServerRequest *request){
    scale.tare(); // スケールをゼロにリセットします
    request->send(200, "text/plain", "OK");
  });
  server.on("/set_angle", HTTP_GET, [](AsyncWebServerRequest *request){
    char buffer[64];
    sprintf(buffer, "{\"weight\":%f}", weight);

    if (request->hasArg("value")) {
      if (isNumeric(request->arg("value"))) {
        angle = request->arg("value").toFloat();
        request->send(200, "text/plain", "OK");
      }else{
        request->send(200, "text/plain", "INVALID_VALUE");
      }
    } else {
      request->send(200, "text/plain", "NO_VALUE");
    }
  });

  // Start server
  server.begin();
}

void loop() {
  Serial.print("Reading: ");
  weight = scale.get_units(5); // 5回の読み取りの平均を取ります。この値もあなたの必要に応じて調整することができます。
  Serial.println(weight);

#ifdef TARGET_DEVICE_ATOMS3
  M5.Lcd.setTextColor(WHITE, BLACK);              // 文字色
  M5.Lcd.setTextFont(2);                          // フォント
  M5.Lcd.setCursor(0, 0);                        // カーソル座標指定
  M5.Lcd.printf("SSID: %.10s\n", WiFi.SSID());       // SSID表示
  // M5.Lcd.printf("SSID: %s\n", WiFi.softAPSSID()); // アクセスポイント時のSSID表示
  M5.Lcd.setTextColor(ORANGE, BLACK);             // 文字色
  M5.Lcd.print("IP  : ");                         // IPアドレス表示
  M5.Lcd.println(WiFi.localIP());
  // M5.Lcd.println(WiFi.softAPIP());             // アクセスポイント時のIPアドレス表示
  M5.Lcd.drawFastHLine(0, 34, 128, WHITE);        // 指定座標から横線
  M5.Lcd.setCursor(0, 38);                        // カーソル座標指定
  M5.Lcd.setTextColor(CYAN, BLACK);               // 文字色
  M5.Lcd.printf("Weight: %.3f\n", weight);        // 
  M5.Lcd.printf("Angle: %.3f\n", angle);        // 
  M5.Lcd.printf("Pulse: %d\n", pulse);        // 
#endif

  switch(reset_state){
    case 1:
      angle = RESET_ANGLE;
      reset_state++;
      break;
    case 2:
      if(pulse == get_pulse(angle)){
        angle = BASE_ANGLE;
        reset_state++;
      }
      break;
    case 3:
      if(pulse == get_pulse(angle)){
        scale.tare(); // スケールをゼロにリセットします
        reset_state = 0;
      }
      break;
    case 0:
    default:
      break;
  }

  {
    const int threashold = 10;
    int _pulse = get_pulse(angle);
    int dif = _pulse - pulse;
    if(abs(dif) > threashold){
      dif = (dif > 0 ? threashold : -threashold);
    }
    pulse += dif;

    servo.write(pulse);
  }
  
  delay(20);
}





