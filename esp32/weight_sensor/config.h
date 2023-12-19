
const char* ssid = "470973829398";
const char* password = "34190590";
//#define USE_STATIC_IP
#ifdef USE_STATIC_IP
const IPAddress ip(192,168,0,100);
const IPAddress gateway(192,168,0,1);
const IPAddress subnet(255,255,255,0);
#endif

//select one
//#define TARGET_DEVICE_ESP_DEVKIT_C
#define TARGET_DEVICE_ATOMS3