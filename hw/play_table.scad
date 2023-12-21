
$fn=30;
module bar1(){
    difference(){
        union(){
            translate([-15/4-5/2,0,0])
            cube([100-15/2-5,15,15], center=true);
            translate([100/2-15/2-5,0,0])
            rotate([90,0,0])
            cylinder(r=15/2, h=19, center=true);
        }
        length=101;
        //length=100-0.3;
        cube([length,10+1,10+1], center=true);
        translate([0,0,-5])
        cube([length,5+1,20], center=true);
    }
}
module bar2(){
    length=100/sqrt(3);
    cube([length,3,10], center=true);
    translate([length/2,0,0])
    rotate([90,0,0])
    cylinder(r=10/2, h=10, center=true);
    
    translate([-length/2,0,0])
    rotate([90,0,0])
    cylinder(r=10/2, h=3, center=true);
}

module base(){
    translate([-100/2-26/2,0,0])
    cube([26,60,2], center=true);
    
    translate([-100/2-5/2,-3/2+15,12/2+2/2])
    cube([5,3,12], center=true);
    
    translate([-100/2-5/2-16-5,-3/2+15,12/2+2/2])
    cube([5,3,12], center=true);
    
    cube([100,20,2], center=true);
    translate([100/2-15/2-5,0,15/2+1])
    difference(){
        cube([25,20,15], center=true);
        hull(){
            rotate([90,0,0])
            cylinder(r=(15+0.5)/2, h=100, center=true);
            translate([0,0,10])
            rotate([90,0,0])
            cylinder(r=(15+0.5)/2, h=100, center=true);
        }
        cube([100,15+0.5,100], center=true);
    }
}

//translate([5,0,28])
//rotate([0,30,0])
bar1();
//translate([-20,0,17])
//rotate([0,-18,0])
//bar2();
//base();