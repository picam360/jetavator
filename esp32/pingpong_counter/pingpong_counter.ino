#include "config.h"

#include <WiFi.h>
#include <ESPAsyncWebServer.h>

#ifdef TARGET_DEVICE_ATOMS3
#include <M5AtomS3.h>     // ATOMS3用ライブラリ
#define SENSOR_PIN 38
#elif TARGET_DEVICE_ESP_DEVKIT_C
#define SENSOR_PIN 38
#endif

AsyncWebServer server(80);

int count = 0;
int loop_count = 0;
int din_count = 0;
unsigned long lastInterruptTime = 0; // 最後の割り込み時刻を保持
const unsigned long debounceTime = 100; // デバウンス時間（ミリ秒）

int reset_state = 0;

void setup() {
#ifdef TARGET_DEVICE_ATOMS3
  M5.begin(true, false, true, false); // AtomS3初期設定（LCD,UART,I2C,LED）
  M5.Lcd.begin();                   // 画面初期化
  M5.Lcd.setRotation(2);            // 画面向き設定（USB位置基準 0：上/ 1：左/ 2：下/ 3：右）
  M5.Lcd.fillScreen(BLACK);         // 背景
#endif

  Serial.begin(9600);
  Serial.println("Start");

  pinMode(SENSOR_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(SENSOR_PIN), [](){
    unsigned long interruptTime = millis();
    if (interruptTime - lastInterruptTime > debounceTime) {
      count++;
      Serial.println(count);
      lastInterruptTime = interruptTime;
    }
  }, FALLING);

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
    sprintf(buffer, "{\"score\":%d}", count);
    request->send(200, "text/plain", buffer);
  });
  server.on("/reset", HTTP_GET, [](AsyncWebServerRequest *request){
    reset_state = 1;
    request->send(200, "text/plain", "OK");
  });

  // Start server
  server.begin();
}

void loop() {
  loop_count++;

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
  M5.Lcd.printf("Count: %d\n", count);            // 
#endif

  switch(reset_state){
    case 1:
      count = 0;
      reset_state = 0;
      break;
    case 0:
    default:
      break;
  }
  
  delay(100);
}





