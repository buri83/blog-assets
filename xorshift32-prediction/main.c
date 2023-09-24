#include <stdio.h>
#include <time.h>

unsigned int xor32(void) {
  static unsigned int s = 1;
  s = s ^ (s << 13);
  s = s ^ (s >> 17);
  s = s ^ (s << 5);
  return s & 0xffff;
}

int main(void){
    unsigned int sequence[] = {17433, 63802, 48521, 8888, 60923, 59364, 53581, 56036, 61202, 34977};
    time_t start_time = time(NULL);

    while (true){
        bool found = true;
        for(int i=0; i<10; i++){
            unsigned int r = xor32();
            if(r != sequence[i]){
                found = false;
                break;
            }
        }

        if(found) {
            break;
        }
    }

    // Predict: 7649 (5s)
    printf("Predict: %d (%lds)", xor32(), (time(NULL) - start_time));
    return 0;
}