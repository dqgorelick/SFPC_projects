int SEGMENTS = 100;

void setup() {
  size(1000, 500);
}

void drawFundamental(float nth, float r, float g, float b) {
  float a = 0;
  float period = TWO_PI*nth;
  float inc = period/SEGMENTS;
  float prev_x = 0, prev_y = height/2, x, y;
  blendMode(ADD);
  stroke(r, g, b);
  strokeWeight(10);
  for (float i=0; i<=width; i=i+width/SEGMENTS) {
    x = i;
    y = height/2 + sin(a) * 3 * width/SEGMENTS * TWO_PI/nth;
    line(prev_x, prev_y, x, y);
    prev_x = x;
    prev_y = y;
    a = a + inc;
  }
}

void draw() {
  background(0);
  drawFundamental(1, 255, 255, 255);
  drawFundamental(2, 255, 0, 0);
  drawFundamental(4, 0, 255, 0);
  drawFundamental(6, 0, 0, 255);
}