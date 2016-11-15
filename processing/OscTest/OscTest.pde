import oscP5.*;
import netP5.*;

OscP5 osc;
NetAddress supercollider; 

void setup() {
  osc = new OscP5(this, 12000);
  supercollider = new NetAddress("127.0.0.1", 57120);
  size(400,400);
}

void mouseDragged() {
 OscMessage msg = new OscMessage("/note");
 //int midi = (floor((float(mouseX)/width)*50)+10);
 float freq = float(mouseX)/width;
 float amp = (1 - float(mouseY)/height);
 if (freq < 0) {
   freq = 0;
 } 
 if (freq > 88) {
   freq = 88;
 }
 if (amp > 1) {
   amp = 1;
 } 
 if (amp < 0) {
   amp = 0;
 }
 msg.add(freq);
 msg.add(amp);
 osc.send(msg, supercollider);
 background(amp*255);
}
void mousePressed() {
  OscMessage msg = new OscMessage("/on");
  osc.send(msg, supercollider);
}

void mouseReleased() {
  OscMessage msg = new OscMessage("/off");
  osc.send(msg, supercollider);
}

void draw() { 
  
}