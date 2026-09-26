//Copyright Spheruler Solutions 2019-2025

//BRIEF SUMMARY OF THE ACCUPAN PROGRAM
 //Aim of this javascript program is to develop and demonstrate a
 // 360 degree panorama scene rendering program named AccuPan 
 // (meaning it can ACCUrately-PANs the panorama scene), according to user
 // interaction in the most logical manner to reproduce the user expected
 // movement of the scene.

 //Unlike all other programs available from multiple vendors (All non-Indian
 // origin!), this program seeks to implement the mathematically correct
 // algorithm that faithfully pans/scales/rotates the scene.
 
 //In case of one screen/mouse left-click and move, the selected point
 // faithfully moves exactly with the mouse/touch (unlike the other viewer
 // programs in the market).

 //The algorithm ensures absence of funny counter opposite motion at the
 // zenith and nadir location of panorama observed in other programs,
 // again because of the choice of a correct geometry/algorithm to ensure
 // user intuitive response.
 
 //If the user drags the point beyond its zone limits (for eg. taking zenith
 // (or) nadir and their nearby regions beyond its centre limits or across the
 // horizon limit), the program intermediately allows the deviation, and
 // smoothly rebounds back to the nearest allowed view state (with zenith/
 // nadir along the central line).

 //This javascript provides the functionality for web developers to add a 360
 // degree panorama content of their input image in rectilinear format, and
 // the web browser renders the scene interactively.
 //It is aimed for this program to be systematically developed to meet
 // various additional needs of the panorama rendering, by appropriate
 // functional calls.

//TODO:
//*It would be of interest to display two output view viewable
//  with VR goggles

//Main inline function call of the ACCUPAN (AP) panorama program.
//All the AP variables are kept local, to avoid clash of variable 
// names from other scripts of the webpage
window.addEventListener('load',function()
{
 //Getting the html document image element
 var AP_InputImage=document.getElementById('Input1_AP');
 //for taking in the input 360 degree equirectangular panoramic image to
 //extract the pixel color details, for subsequent rendering of scene
 //Function call/variable for choosing the image file from webpage and display
 var AP_choosefile=document.getElementById('choose-file');
 //CANVAS VARIABLE that links to the canvas window Id declared in the html page
 var AP_Can=document.getElementById('Output');
 //Defining the 2D Context of the output canvas and with the transparency
 // scope declared as false (not applicable) for optimized rendering in browser
 var AP_Ctx=AP_Can.getContext('2d',{alpha:false});
 //Variables for storing, calculating and updating the Output Image Data and
 //the Pixel RGB color details of the canvas
 var AP_ImgOd=[], AP_PixO=[];

 //Defining the upper limit of 50 million pixels for the
 // input equirectangular image, and allocating the associated memory
 var AP_Max_Pixel_Size=10000*5000;
 //NOTES: For efficiency of rendering calculation, six gnomonic projected view 
 // along the six orthogonal directions (+/-X/Y/Z) termed Cube Maps are useful
 //Corresponding maximum size of the equivalent Cube Map Size, plus 1 
 // considered for approximation (when actual CMS assigned to next even value)
 var AP_Max_CMS=Math.floor(Math.sqrt(AP_Max_Pixel_Size/6))+1;
 //Alloting space for array variable of 8-bit unsigned integer (255 max value)
 // of ~150 MB size, for use in storing the input pixel color details of 50 MP 
 // max image (3*10000*5000) and meant to be stored in the cube map format
 // among the six cube map faces, (for quicker rendering without involving 
 // trigonometric calculations)
 var AP_PixIC=new Uint8ClampedArray(3*6*AP_Max_CMS*AP_Max_CMS);
 //Size of Output Canvas Height and Width
 var AP_SOH, AP_SOW;
 //Equivalent Cube Map Size of the Input Image Array
 var AP_CMS;
 //Half Field of View in Output Vertical Canvas - Default guiding Value of 
 // 60 degrees considered for central field of vision (applicable at 1x AP_Mag)
 var AP_HFOVS=Math.PI/6.0;
 //Full field of view of the output canvas in horizontal & vertical direction 
 var AP_FOVH, AP_FOVV;
 //Relative Magnification, and Scaling Factor, used to relate pixel coordinates
 // (wrt output canvas centre) to 3d vector coordinates
 var AP_Mag, AP_SF;

 //NOTES: Notation about axis system: There are three pertinent axis system:
 // * Canvas 2D screen, * Current view 3D, and * Input panorama data 3D system
 // with screen centre as common origin.
 // For Canvas 2D screen, the horizontal right denotes its +x axis, while
 // vertical down denotes its +y axis. Point coordinates are measured from
 // top-left corner while image/canvas reference centre is more useful.
 //The x-y-z of the 'Current view 3D' is the primary reference in calculations:
 // +x axis runs along screen horizontal, and pointing right, its +y axis 
 // points into the screen and the +z axis runs vertical up. In panoramic
 // calculation, unit sphere centred at view point is conveniently considered.
 //The starting x-y-z view axis provides the reference for tracking 'Current 
 // view 3D' axis itself. In the starting input panorama input image, the 
 // horizontal right denotes the +x axis, image perpendicular vector is parallel
 // to +y axis, and the vertical up connotes the +z axis of starting 3D view
 //The geometric rotation relation between starting 3D axis and current 3D axis 
 // is calculated through vectors, quaternions and rotation matrix concepts
 //Input Panorama image data are generally represented in Equirectangular 
 // format and also assumed here, and pixel data extracted accordingly.
 //For the given calculated rotated view condition, the output view is
 // calculated by considering the parameters (Scale factor, Magnification)
 // associated with Image field of view and zoom conditions.
 //The specific (gnomonic) projection relation between (x,y,z) of current 3d
 // view and cancvas coordinates is used for developing panning calculations
 
 //Quaternion parameters of current/New state, arising from an immediate PAST 
 // state by an ADDITIONAL Rotation process
 var AP_qn0, AP_qn1, AP_qn2, AP_qn3;
 var AP_qp0, AP_qp1, AP_qp2, AP_qp3;
 var AP_qa0, AP_qa1, AP_qa2, AP_qa3;
 //x,y,z components of Rotation axis normal vector and Rotation step angle
 // in radians. It represents the rotation about current axis defined wrt 
 // the original/starting panorama axis system
 var AP_Rotx, AP_Roty, AP_Rotz, AP_RotWs;
 //Rotation matrix elements denoting the resolved components of the current
 // orthonormal axis Rx, Ry, Rz of the scene wrt to starting/panorama 
 // x-y-z axis (last suffix)
 var AP_Rxx, AP_Rxy, AP_Rxz, AP_Ryx, AP_Ryy, AP_Ryz, AP_Rzx, AP_Rzy, AP_Rzz;
 //x,y,z components of the Top most/Zenith point(equal to AP_Rxz, AP_Ryz, 
 // AP_Rzz from the inverse rotation matrix) of the panorama image used for 
 // checking if it traces within the upper hemisphere central line, and for
 // start/concurrent location in panning
 var AP_Tx, AP_Ty, AP_Tz;

 //For noting the size of canvas element and its relative position to the view
 // port using getBoundingClientRect function and using it for calculating the 
 // relative position of canvas event (mouse/touch screen) location 
 var AP_Rect;
 //For noting the screen/viewport coordinate position of mouse-down/move/up or 
 // touch/move Event on the canvas
 var AP_Evx, AP_Evy;
 //Mouse or Touch Point(s) (P1 and P2 - before and after movement), 
 // h-horizontal v-vertical coordinates of the pixel centre wrt to the canvas 
 // centre, and their corresponding (x,y,z) coordinates
 var AP_P1x, AP_P1y, AP_P1z;
 var AP_P2x, AP_P2y, AP_P2z;
 //Variable for noting the double-touch moved location point in output canvas
 var AP_a1, AP_a2, AP_b1, AP_b2;

 //Type of Animation Play status 0-pause 1-play, 2-status registration 
 // mouse down to implement appropriate pause/play on mouse-click, screen-tap
 var AP_AnimPlay;
 //Mouse-Down or One Touch state on canvas. 0-Mouse up or no-touch (inactive)
 // , 1-Active Mouse-down/One Touch started, but movement not realised, 
 // 2-Mouse movement started/One touch moved and active
 var AP_MD;
 //Track variable for no. of Touch Points 0:none, 1 no-related to paning, 
 // 2 nos-related to two-point zooming/rotating, -1 for inrelevant touch 
 // states (such as: >2 TP, rebounds, double to single TP status)
 var AP_TP;
 //Status of pan movement 0-inactive, non-zero active, 1-valid mouse movements,
 // 2,3-limit crossed movements, 2-Zenith at lower hemishphere (but vertical)
 // 3-zenith off-middle axis, 5-double touch moves, and applicable rebound mode 
 // after (4)mouse/(6)touch release to bring back the view from the off-limits
 // 7-unimplementable double touch moves
 var AP_PanStat;
 //Double Touch Down Status 0-inactive, 1-Active/started, 2-Active/moved
 var AP_DTS;
 //Type of Zoom in operation 0-inactive, 1-zoom out and 2-zoom in
 // 3-8: extrement zoom limits, 3/4 foV Max/min. limit, 5/6 zenith/nadir
 // beyond horizon limit, 7/8: zenith/nadir slanted from central y-z plane
 var AP_Zoom;
 //Mouse-down or 1-Touch start position noted wrt the canvas left, top corner 
 // point and further calculated wrt to canvas view center
 var AP_Mdx, AP_Mdy;
 //To track if the canvas full screen is active or not
 var AP_FullScreenOn=false;
 
 //Status of Legend/Label Display, activated by default
 var AP_LegDisp=true;
 //The second (II) set of rotation process required for rebound (if necessary), 
 // when the pan view is moved to a upside type position or roll orientation 
 // change of head, which are precluded in general panorama view rendering
 //Rotation axis and Net rotation angle for getting back the acceptable natural
 // view of scene
 var AP_RotIIx, AP_RotIIy, AP_RotIIz, AP_RotIIW;
 //No. of rendering cycles considered for smooth rebound depiction, and its 
 // count for use in repeated calls of AP_Rebound function
 var AP_Rebound_Cycles, AP_Cycle_no;
 //Time stamp initial value (milliseconds since 1Jan, 1970) and subsequent
 // Next ones for resolving mouse/touch screen double-click events
 var AP_Time_first=Date.now();
 var AP_Time_next=AP_Time_first;
 //Variable for identifying Touch based double-click event 0: none, 1: first
 // click & active 2: identfied DblClk
 //Note: Mouse Double-click is directly handled using the event listener
 var AP_Touch_Dbclk=0;
 //Gnonmonic projection coordinates of the two Touch points at Initial/start 
 // for user controlled pinch or rotation effects (during touch move process)
 var AP_Ti1x, AP_Ti1y, AP_Ti1z, AP_Ti2x, AP_Ti2y, AP_Ti2z;
 //Begin view Magnification value at start of valid two-point touch event
 var AP_MagB;
 //Magnification Steps considered in case of Rebounding from Min/Max 
 // magnification limits on Double Touch End 
 var AP_Mag_Step;
 //state variables for checking OrientationSensor based browser device,
 // its Activation status from canvas button, First cycle started status
 var AP_DevOrient=false;
 var AP_DevOrientActive=false;
 var AP_DevOrientStarted=false;
 //Device orientation angles in radians, and Quaternion Additional Start
 var AP_gammarad, AP_betarad, AP_alpharad;
 var AP_qas0, AP_qas1, AP_qas2, AP_qas3;
 
 //A default quick canvas content, till the output scene pixels are computed
 // for showing Progress kind of mouse pointer status
 document.body.style.cursor='progress'; 
 //Defining and filling white color in the canvas region of default dimension
 AP_Ctx.fillStyle='#FFFFFF';
 AP_Ctx.fillRect(0,0,AP_Can.width,AP_Can.height);
 //Defining the font color, size, type and placing the 'Loading...' text status
 // on the canvas window
 AP_Ctx.fillStyle = "red"; AP_Ctx.font ='20px Comic Sans MS'; 
 AP_Ctx.fillText('Loading...',0,30);
  
 //Standard declaration for Animation frame repitition for various browsers
 requestAnimationFrame = window.requestAnimationFrame || 
 window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || 
 window.msRequestAnimationFrame;

 //Function for requesting device orientation, necessary for ioS browsers
 function AP_DeviceOrientationRequestPermission()
 {
  //syntax for requesting permission for device motion in Apple devices
  if (typeof DeviceMotionEvent.requestPermission === 'function') 
  {
   DeviceMotionEvent.requestPermission().then(permissionState =>
   { if (permissionState === 'granted') { } })
   .catch(console.error);
  } 
  else {} // handle regular non iOS 13+ devices
  //syntax for requesting permission for device orientation in Apple devices
  if (typeof DeviceOrientationEvent.requestPermission === 'function') 
  {
   // Handle iOS 13+ devices.
   DeviceOrientationEvent.requestPermission().then((state) => 
   {
    if (state === 'granted') {}
    else { console.error('Request to access the orientation was rejected'); }
   })
   .catch(console.error);
  }
  else { }// Handle regular non iOS 13+ devices.
 }

 //If the device orientation sensing event is detected
 if (window.DeviceOrientationEvent) 
 {
  //noting the parameter
  AP_DevOrient=true;
  //and initiatinng ghe device orientation listener funtion
  window.addEventListener('deviceorientation',function(AP_Ev)
  {
   //Quaternion  terms for Additional Rotation calculation Fresh value
   var AP_qaf0, AP_qaf1, AP_qaf2, AP_qaf3;
   //If the device orientation is in active mode
   if (AP_DevOrientActive)
   {
    //Note the current quaternion parameter status as the present quaternion
    AP_qp0=AP_qn0; AP_qp1=AP_qn1; AP_qp2=AP_qn2; AP_qp3=AP_qn3;
    //Noting the alpha, beta and gamma orienation device paramerers in radians
    AP_alpharad=-AP_Ev.alpha*Math.PI/360;
    AP_betarad=AP_Ev.beta*Math.PI/360;
    AP_gammarad=AP_Ev.gamma*Math.PI/360;
    //On device orientation started for the first cycle
    if (!AP_DevOrientStarted)  
    {
     //Starting value of Quaternion associated with Additional rotation
     AP_qas0=Math.cos(AP_alpharad)*Math.cos(AP_betarad)*Math.cos(AP_gammarad)
      +Math.sin(AP_alpharad)*Math.sin(AP_betarad)*Math.sin(AP_gammarad);
     AP_qas1=Math.cos(AP_alpharad)*Math.sin(AP_betarad)*Math.cos(AP_gammarad)
      +Math.sin(AP_alpharad)*Math.cos(AP_betarad)*Math.sin(AP_gammarad);
     AP_qas2=Math.sin(AP_alpharad)*Math.cos(AP_betarad)*Math.cos(AP_gammarad)
      -Math.cos(AP_alpharad)*Math.sin(AP_betarad)*Math.sin(AP_gammarad);
     AP_qas3=Math.cos(AP_alpharad)*Math.cos(AP_betarad)*Math.sin(AP_gammarad)
     -Math.sin(AP_alpharad)*Math.sin(AP_betarad)*Math.cos(AP_gammarad);
     //Noting the Device Orientation Calculation to have been started
     AP_DevOrientStarted=true;
    }
    else
    {
     //Fresh value of Quaternion associated with Additional rotation
     AP_qaf0=Math.cos(AP_alpharad)*Math.cos(AP_betarad)*Math.cos(AP_gammarad)
      +Math.sin(AP_alpharad)*Math.sin(AP_betarad)*Math.sin(AP_gammarad);
     AP_qaf1=Math.cos(AP_alpharad)*Math.sin(AP_betarad)*Math.cos(AP_gammarad)
      +Math.sin(AP_alpharad)*Math.cos(AP_betarad)*Math.sin(AP_gammarad);
     AP_qaf2=Math.sin(AP_alpharad)*Math.cos(AP_betarad)*Math.cos(AP_gammarad)
      -Math.cos(AP_alpharad)*Math.sin(AP_betarad)*Math.sin(AP_gammarad);
     AP_qaf3=Math.cos(AP_alpharad)*Math.cos(AP_betarad)*Math.sin(AP_gammarad)
      -Math.sin(AP_alpharad)*Math.sin(AP_betarad)*Math.cos(AP_gammarad);
   
     //Calculation of the net additional rotation quaternion
     AP_qa0=AP_qas0*AP_qaf0+AP_qas1*AP_qaf1+AP_qas2*AP_qaf2+AP_qas3*AP_qaf3;
     AP_qa1=AP_qas0*AP_qaf1-AP_qas1*AP_qaf0-AP_qas2*AP_qaf3+AP_qas3*AP_qaf2;
     AP_qa2=AP_qas0*AP_qaf2-AP_qas2*AP_qaf0-AP_qas3*AP_qaf1+AP_qas1*AP_qaf3;
     AP_qa3=AP_qas0*AP_qaf3-AP_qas3*AP_qaf0-AP_qas1*AP_qaf2+AP_qas2*AP_qaf1;
     //Upating the fresh quaternion value to the starting additional quaternion
     AP_qas0=AP_qaf0; AP_qas1=AP_qaf1;  AP_qas2=AP_qaf2;  AP_qas3=AP_qaf3; 
     //Calculating the net new quaternion rotation and rendering it
     AP_qn0=AP_qp0*AP_qa0-AP_qp1*AP_qa1-AP_qp2*AP_qa2-AP_qp3*AP_qa3;
     AP_qn1=AP_qp0*AP_qa1+AP_qp1*AP_qa0+AP_qp2*AP_qa3-AP_qp3*AP_qa2;
     AP_qn2=AP_qp0*AP_qa2+AP_qp2*AP_qa0+AP_qp3*AP_qa1-AP_qp1*AP_qa3; 
     AP_qn3=AP_qp0*AP_qa3+AP_qp3*AP_qa0+AP_qp1*AP_qa2-AP_qp2*AP_qa1;
     AP_Render();
    }
   }
  });
 } else AP_DevOrient=false;

 //set of all similar variable names declared within different functions
 // AP_Ev (in several canvas event functions)
 // AP_SIH, AP_SIW, AP_iC, AP_jC, AP_hC, AP_vC, AP_pIC, AP_ImgId, AP_IndI, 
 // AP_Phi1, AP_Theta, AP_Phi (in AP_InputData function)
 // AP_DropImg, AP_InputFile, AP_img, AP_reader (in AP_HandleDrop function)
 // AP_AspRat (in AP_ResizeRender functions)
 // AP_IndO, AP_xI, AP_yI, AP_zI (in AP_Render function)
 // AP_T1y, AP_T1z, AP_T2y, AP_T2z, AP_PChgx, AP_PChgy, AP_PChgz, AP_TChgx,
 //  AP_TChgy, AP_TChgz, AP_VMag, AP_Net_Rot1x, AP_Net_Rot1y, AP_Net_Rot1z,
 //  AP_Net_Rot1W, AP_Net_Rot2x, AP_Net_Rot2y, AP_Net_Rot2z, AP_Net_Rot1W,
 //  AP_Net_Rotx, AP_Net_Roty, AP_Net_Rotz, AP_Net_RotW (in AP_Move function) 
 // AP_Term1-7 (in AP_InputData), AP_Term1-12 (in AP_Render), AP_Term1-6
 // (in AP_Move)

 //Functions declared/defined within Javascript code: window.onload,
 // AP_HandleDrop(), AP_InputData(), AP_InputResizeRender(), AP_ResizeRender(),
 // AP_Render(), AP_Start(), AP_End(), AP_PauseResume(), AP_MouseMove(),
 // AP_Move(), AP_ZoomInOut(), AP_TouchStart(), AP_TouchMove(), AP_TouchEnd()

 // (to be modified or re-developed) var AP_Dist1; var AP_Dist2; 
 // var AP_DistR; var AP_TouchX; var AP_TouchY;

 //Performing the first default function call to read input image,
 // consider canvas size, calculate and render output scene
 AP_InputImage.onload=AP_InputResizeRender(); 

 //Set of all function calls arising due to event initated by user interactions
 // such as with mouse/touch/scroll/drag-and-drop in the canvas region
 //Upon window resize, function call to choose an optimum canvas window size,
 // and calculate/render the output image scene                                                  
 window.addEventListener('resize', AP_ResizeRender);
 
 //Initiated by user interaction of drag and enter/over/drop an input image 
 //type of file into the canvas                                                     
 //function call to take in the input panormama image file or from the source
 // file name (located within the current access), by 'Drag and Drop' into the
 // canvas region
 AP_Can.addEventListener('dragenter', function(AP_Ev)
 {
  //To prevent any default browser action upon drag enter event on canvas
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
  document.getElementById('Output').style.cursor='progress';
 });
 AP_Can.addEventListener('dragover',function(AP_Ev) 
 {
  //To prevent any default browser action upon dragover event on canvas
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
 });
 //To start the function routine after drop of input image file to read its
 // content and display the new panorama scene
 AP_Can.addEventListener('drop', function(AP_Ev)
 {
  var AP_InputFile;
  //To prevent any default browser action upon drag and drop event on canvas
  AP_Ev.stopPropagation(); AP_Ev.preventDefault(); 
  //Considering if the dropped object is a literal image data 
  var AP_Object=AP_Ev.dataTransfer.getData('text/plain'); 
  //TODO: After many attempts, auto rendering from dropped image not met!
  if (AP_Object) 
  {
   /* AP_InputImage.onload=function(AP_Object)
   {
    AP_LegDisp=false; 
    AP_InputResizeRender();
   };
   AP_InputImage.src=AP_Object; */
  } 
  //If the the dropped object is not image, but a URL value 
  else
  {
   //Associating the Image file to be the first among the dropped files
   var AP_InputFile = AP_Ev.dataTransfer.files[0]; 
   var AP_reader=new FileReader();
   AP_reader.onload=function(AP_DropImg)
   {
    AP_InputImage.src=AP_DropImg.target.result;
    AP_InputImage.onload=function()
    {
     AP_LegDisp=false; 
     AP_InputResizeRender();
    };
   };
   AP_reader.readAsDataURL(AP_InputFile);
  }
 });
  
 //Associated actions caused by mouse down/move/up user controls
 //Noting the pixel point of mouse down for tracking/appropriate panoramic
 // locking its subsequent movement within the scene                
 AP_Can.addEventListener('mousedown', function (AP_Ev)
 {
  //prevent the general browser response of default propagation events
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
  //if it is left-mouse (down) and Pan Status is inactive or zero (finished 
  // rebounds, if any) and no simultaneous active (screen) touch point(s)
  if ( (AP_Ev.button==0) && (AP_PanStat==0) && (AP_TP==0) )
  {
   //change the cursor style to crosshair to denote point tracking
   document.getElementById('Output').style.cursor='crosshair';
   //Note the point (x,y) coordinates of Mouse down Event instance
   AP_Evx=AP_Ev.clientX; AP_Evy=AP_Ev.clientY;
   //Update the parameter status of Mouse-down, Touch Points and Start Pan
   AP_MD=1; AP_TP=-1; 
   AP_Start(); 
  }
  //if there were any touch points active, and mouse-down interfered, 
  //then make the touch point operation null by negative assignment
  if (AP_TP>=1) AP_TP=-1;
 });
 //Noting the mouse move position over the canvas (to do appropriate scene 
 //panning when the left-mouse button is in down position)
 AP_Can.addEventListener('mousemove', function(AP_Ev)
 {
  //Gnomonic projection distance coordinates of the new(2) mouse point
  var AP_P2hO, AP_P2vO;
  //To prevent any default browser action upon dragover event on canvas
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
  //On mouse-click move, to stop any active device orientation activity
  AP_DevOrientActive=false;
  //If the mouse-down status is 1(unmoved) or 2(already moved0)
  if (AP_MD>=1) 
  {
   //Noting the mouse coordinates on screen
   AP_Evx=AP_Ev.clientX; AP_Evy=AP_Ev.clientY;
   //Noting the present set of quaternion rotation parameters
   AP_qp0=AP_qn0; AP_qp1=AP_qn1; AP_qp2=AP_qn2; AP_qp3=AP_qn3;
   //Calculating the gnomonic projection distance and unit vector coordinates
   AP_P2hO=(AP_Evx-AP_Rect.left+0.5-0.5*AP_SOW)*AP_SF;
   AP_P2vO=(0.5*AP_SOH-0.5-AP_Evy+AP_Rect.top)*AP_SF;
   AP_P2y=1/Math.sqrt(1+AP_P2hO*AP_P2hO+AP_P2vO*AP_P2vO);
   AP_P2x=AP_P2y*AP_P2hO;AP_P2z=AP_P2y*AP_P2vO;
   //Noting the mouse moved status as moved, and calling the Move function
   AP_MD=2; AP_Move(); 
  }
  else { document.getElementById('Output').style.cursor='default'; }
 });
 //Function to display the final scene when the the left-mouse click-dragged 
 //and upped at its new position
 AP_Can.addEventListener('mouseup', function(AP_Ev)
 {
  //if it is left-mouse (up)
  if (AP_Ev.button==0)
  {
   AP_Ev.stopPropagation(); AP_Ev.preventDefault();
   document.getElementById('Output').style.cursor='default'; 
   AP_End(); AP_TP=0;
  }
 });
 //When the mouse moved beyond the canvas zone, to stop responding and consider
 // it to be mouse-down 'OFF' state anyway
 AP_Can.addEventListener('mouseout', function(AP_Ev)
 { 
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
  if (AP_MD==2) AP_End();
  AP_AnimPlay=0; AP_MD=0; AP_TP=0;
  document.getElementById('Output').style.cursor='default';
 });

 //Mouse special functions for double-click and scroll event
 //To move the scene to starting position (called in 'dblclick' and used in 
 // 'touchend' canvas eventListener)
 AP_Can.addEventListener('dblclick', AP_StartPosition);
 
 //Zooming In or Out into the scene
 AP_Can.addEventListener('wheel', function (AP_Ev) 
 {
  var AP_P1hOz, AP_P1vOz, AP_P2hOz, AP_P2vOz;
  AP_Ev.stopPropagation(); AP_Ev.preventDefault(); 
  AP_DevOrientActive=false;
  AP_AnimPlay=0; AP_MD=0; AP_DTS=0; AP_TP=0;
  AP_qp0=AP_qn0; AP_qp1=AP_qn1; AP_qp2=AP_qn2;
  AP_qp3=AP_qn3; AP_Tx=AP_Rxz; AP_Ty=AP_Ryz; AP_Tz=AP_Rzz;
  AP_P1hOz=(AP_Ev.clientX-AP_Rect.left+0.5-0.5*AP_SOW)*AP_SF;
  AP_P1vOz=(0.5*AP_SOH-0.5-AP_Ev.clientY+AP_Rect.top)*AP_SF;
  AP_P1y=1/Math.sqrt(1+AP_P1hOz*AP_P1hOz+AP_P1vOz*AP_P1vOz);
  AP_P1x=AP_P1y*AP_P1hOz;
  AP_P1z=AP_P1y*AP_P1vOz;

  if (AP_Ev.deltaY>0) 
  { 
   if (AP_Mag<=4.0) 
   {
    AP_Mag=AP_Mag*1.1;  AP_Zoom=1; 
    AP_P2hOz=AP_P1hOz*1.1; AP_P2vOz=AP_P1vOz*1.1; 
   }
   else AP_Zoom=3;
  }
  if (AP_Ev.deltaY<0)
  { 
   if (AP_Mag>=0.25) 
   { 
    AP_Mag=AP_Mag*0.9; AP_Zoom=2; 
    AP_P2hOz=AP_P1hOz*0.9; AP_P2vOz=AP_P1vOz*0.9;
   }
   else AP_Zoom=4;
  }
 
  if ( (AP_Zoom!=1) && (AP_Zoom!=2) )
  { 
   document.getElementById('Output').style.cursor='not-allowed';
   AP_Render();
  }
  else
  {
   AP_P2y=1/Math.sqrt(1+AP_P2hOz*AP_P2hOz+AP_P2vOz*AP_P2vOz); 
   AP_P2x=AP_P2y*AP_P2hOz; AP_P2z=AP_P2y*AP_P2vOz; AP_Move();
   AP_Zoom=0;
  }
  AP_PanStat=0;
 });

 //function call upon screen touch start event for responding similarly 
 // to that of mouse-down start event
 //Call routine to begin scene panning (single touch) or scene rotate/zoom 
 // (double touch) or ignore (>2 touch points)
 AP_Can.addEventListener('touchstart', function (AP_Ev) 
 {
  //Gnomonic projection distance coordinates of start touch point(s)
  var AP_TihO, AP_TivO;
  //Time tracking for resolving double-click 1-touch start event
  AP_Time_next=Date.now();
  //prevent the general browser response of default propagation events
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
  //To consider (additional) touch activity start if none was prior active
  //or single touch was alone active and in valid mode
  if (AP_PanStat<=1) 
  {
   //when number of touch point is one, to initiate the pan type of
   // activity similar to mouse-down action
   if ( (AP_Ev.touches.length==1) && (AP_TP==0)  )
   {
    //showing the cursor style to be crosshair to denote point 
    // tracking (although hidden over finger touch)
    document.getElementById('Output').style.cursor='crosshair';
    //To note it as the first (mouse-down) point for start of 
    // possible pan type of scene movement
    AP_TP=1; AP_MD=1; AP_DTS=0;
    //Noting the pixel coordinates of the event touch point
    // for subsequent calculation in AP_Start
    AP_Evx=AP_Ev.touches[0].clientX; AP_Evy=AP_Ev.touches[0].clientY; 
    //Resolving double-click based on time interval (0.5s) between 1-touch events
    if ((AP_Time_next-AP_Time_first)>500)
    {
     AP_Time_first=AP_Time_next; AP_Touch_Dbclk=0;
    }
    else
    {
     AP_Touch_Dbclk=1;
    }
    //Calling the pan start function, similar to that at the mouse down routine
    AP_Start(); 
   }
   //When the number of touch point is two, and when the previous noted
   // status of touch point is 1
   if ( (AP_Ev.touches.length==2) && (AP_TP==1) )
   {
    //showing the cursor style to be crosshair to denote point tracking
    // (although hidden over finger touch)
    document.getElementById('Output').style.cursor='crosshair';
    AP_TP=2; //To note the two touch point status
    //Stopping animation play, Active Double-Touch Status, Inactive Mousedown
    AP_AnimPlay=0; AP_DTS=1; AP_MD=0;
    //Calcualting the gnomonic projection distances of screen touch point
    AP_TihO=(AP_Ev.touches[0].clientX-AP_Rect.left+0.5-0.5*AP_SOW)*AP_SF; 
    AP_TivO=(0.5*AP_SOH-0.5-AP_Ev.touches[0].clientY+AP_Rect.top)*AP_SF;
    //and calculating the initial vector components of the two touch points
    AP_Ti1y=1/Math.sqrt(1+AP_TihO*AP_TihO+AP_TivO*AP_TivO);
    AP_Ti1x=AP_Ti1y*AP_TihO; AP_Ti1z=AP_Ti1y*AP_TivO;
    AP_TihO=(AP_Ev.touches[1].clientX-AP_Rect.left+0.5-0.5*AP_SOW)*AP_SF;
    AP_TivO=(0.5*AP_SOH-0.5-AP_Ev.touches[1].clientY+AP_Rect.top)*AP_SF; 
    AP_Ti2y=1/Math.sqrt(1+AP_TihO*AP_TihO+AP_TivO*AP_TivO);
    AP_Ti2x=AP_Ti2y*AP_TihO; AP_Ti2z=AP_Ti2y*AP_TivO;
    //Noting the beginning magnification for two-touch start condition
    AP_MagB=AP_Mag/AP_SF;
    AP_Render();
   }
   //when number of touch point exceeds two, then to inactivate the 
   // Mouse/Touch movements by changing the parameter status of touch/mouse
   if (AP_Ev.touches.length>2) 
   {
    AP_TP=-1; AP_DTS=0; AP_MD=0; 
   }
  }
  //If single-touch valid movement condition is not met
  else 
  {
   //When the third touch point initiated, to stop the double touch panning
   if (AP_Ev.touches.length>2) { if (AP_DTS==2) AP_DoubleTouchEnd(); }
   //To stop the single touch panning on second touch entry
   if (AP_Ev.touches.length==2) AP_End();
   //Noting the touch point and double touch status as inactive, 
   AP_TP=-1; AP_DTS=0;
  }
 });

 //Call function to calculate and render scene panning (single touch) or scene
 // rotate/zoom (double touch)
 //Note: In mouse events, panning stops when the mouse leaves the canvas.
 // Whereas, in single touch moves, the panning pauses when touch point leaves
 // the canvas, and can resume when touch point comes back within canvas.
 // Similarly, in double touch move events, the function is continued, while
 // but has meaningful relevance when touch point is within the canvas
 AP_Can.addEventListener('touchmove', function(AP_Ev) 
 {
  //Gnomonic projection distance coordinates of the new(2) touch point
  var AP_P2hO, AP_P2vO;
  //set of variables associated with two-touch panning calculation
  //Cosine Angle value of the starting two point vectors
  var AP_CA;
  //Relative coordinates of current two touch points wrt canvas centre
  //var AP_a1, AP_b1, AP_a2, AP_b2;
  //quadratic equation terms and determinenant
  var AP_A, AP_B, AP_C, AP_QDet;
  //for solving two (squared) solutions, and ScalingFactorMagnification value
  var AP_U1, AP_U2, AP_SFm;
  //Unit vector coordinates of the two current touch points based on solved SFm
  var AP_Tm1x, AP_Tm1y, AP_Tm1z, AP_Tm2x, AP_Tm2y, AP_Tm2z;
  //Change in two touch point coordinates compared with initial point
  var AP_T1Chgx, AP_T1Chgy, AP_T1Chgz, AP_T2Chgx, AP_T2Chgy, AP_T2Chgz;
  //vector dot product value of rotation axis and the two touch point vectors
  // for 2-touch panning, Magnitude for normalizing Rotation axis vector
  var AP_CRT1, AP_CRT2, AP_TMag, AP_qR;
  //Rotation axis and omega(W) angle for live panning rotation
  var AP_TRotx, AP_TRoty, AP_CosVal, AP_TRotz, AP_TW;
  //Transformed Top/zenith axis vector components and the nearest rebound point
  var AP_TTmx, AP_TTmy, AP_TTmz, AP_RTmx, AP_RTmy, AP_RTmz;
  //Variable added to separately store the 1-touch point
  var AP_Evxm, AP_Evym;

  //To prevent default canvas interaction acitions
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();

  //On any touch point move activity, stop any device orientation activity
  AP_DevOrientActive=false;
  //When the single touch is active, to do applicable panning
  if (AP_Ev.touches.length==1) 
  {
   //When in fact the number of touch point is 1
   if (AP_TP==1)
   {
    //Executing panning calculations similar to mouse-down move condition
    if (AP_MD>=1) 
    {
     //Noting the new moved touch coordinates on screen
     AP_Evxm=AP_Ev.touches[0].clientX; AP_Evym=AP_Ev.touches[0].clientY;
     //If the touch coordinates is within the canvas region
     if ( (AP_Evxm>AP_Rect.left) && ((AP_Evxm-AP_Rect.left)<AP_Rect.width) 
      && (AP_Evym>AP_Rect.top) && ((AP_Evym-AP_Rect.top)<AP_Rect.height) )
     {
      //Noting the present set of quaternion rotation parameters
      AP_qp0=AP_qn0; AP_qp1=AP_qn1; AP_qp2=AP_qn2; AP_qp3=AP_qn3;
      //Gnomonic projection distance and unit vector values of touch point
      AP_P2hO=(AP_Evxm-AP_Rect.left+0.5-0.5*AP_SOW)*AP_SF;
      AP_P2vO=(0.5*AP_SOH-0.5-AP_Evym+AP_Rect.top)*AP_SF;
      AP_P2y=1/Math.sqrt(1+AP_P2hO*AP_P2hO+AP_P2vO*AP_P2vO);
      AP_P2x=AP_P2y*AP_P2hO; AP_P2z=AP_P2y*AP_P2vO;
       //Noting the touch/mouse moved status as moved & calling Move Function
      if ( (Math.abs(AP_Evxm-AP_Evx)>2) || (Math.abs(AP_Evym-AP_Evy)>2) ) AP_MD=2;
      AP_Move(); 
     }
    }
   }
   //If the touch point status in not 1, then stop 1-touch panning
   else AP_TP=-1;
  }
  //When the double touch is on and active, to do applicable panning
  if (AP_Ev.touches.length==2)
  {
   if ( (AP_TP==2) && (AP_DTS>=1) )
   {
    //Calculation of cosine angle (invariant) of starting two-touch point
    AP_CA=AP_Ti1x*AP_Ti2x+AP_Ti1y*AP_Ti2y+AP_Ti1z*AP_Ti2z;
    //Calculation of the two governing touch point coordinate wrt centre
    AP_a1=AP_Ev.touches[0].clientX-AP_Rect.left+0.5-0.5*AP_SOW;
    AP_b1=0.5*AP_SOH-0.5-AP_Ev.touches[0].clientY+AP_Rect.top;
    AP_a2=AP_Ev.touches[1].clientX-AP_Rect.left+0.5-0.5*AP_SOW;
    AP_b2=0.5*AP_SOH-0.5-AP_Ev.touches[1].clientY+AP_Rect.top;
 
    //The governing terms of quadratic equation a*x*x+b*x+c=0
    //for solving x=SFm(ScalingFactorofMagnification)
    AP_A=(AP_a1*AP_a2+AP_b1*AP_b2)*(AP_a1*AP_a2+AP_b1*AP_b2)
     -AP_CA*AP_CA*(AP_a1*AP_a1+AP_b1*AP_b1)*(AP_a2*AP_a2+AP_b2*AP_b2);
    AP_B=2*(AP_a1*AP_a2+AP_b1*AP_b2)
     -AP_CA*AP_CA*(AP_a1*AP_a1+AP_b1*AP_b1+AP_a2*AP_a2+AP_b2*AP_b2);
    AP_C=1-AP_CA*AP_CA;
    AP_QDet=AP_B*AP_B-4*AP_A*AP_C;
    //solving for real solution for positive determinent of quadratic equation
    if (AP_QDet>=0)
    {
     //Finding the two solutions for squared value of ScalingFactorMagnified 
     if (AP_A>0)
     {
      AP_U1=(-AP_B+Math.sqrt(AP_QDet))/(2*AP_A);
      AP_U2=(-AP_B-Math.sqrt(AP_QDet))/(2*AP_A);
     }
     else
     {
      AP_U1=(-AP_B-Math.sqrt(AP_QDet))/(2*AP_A);
      AP_U2=(-AP_B+Math.sqrt(AP_QDet))/(2*AP_A);
     }
     //if the greatest of two solution is positive
     if (AP_U1>0)
     {
      AP_SFm=Math.sqrt(AP_U1); //a possible first solution
      //if the second solution is also positive
      if (AP_U2>0)
      {  
       //then chosing the SFm solution with least change in SF value
       if ( Math.abs(Math.sqrt(U2)-AP_SF)<Math.abs(Math.sqrt(U1)-AP_SF) )
       AP_SFm=Math.sqrt(AP_U2);
      }
   
      //Based on solved SFm, finding the new coordinates of 1,2 touch points
      AP_Tm1y=1/Math.sqrt(1+AP_a1*AP_a1*AP_SFm*AP_SFm
       +AP_b1*AP_b1*AP_SFm*AP_SFm);
      AP_Tm1x=AP_Tm1y*(AP_a1*AP_SFm);
      AP_Tm1z=AP_Tm1y*(AP_b1*AP_SFm);
      AP_Tm2y=1/Math.sqrt(1+AP_a2*AP_a2*AP_SFm*AP_SFm
       +AP_b2*AP_b2*AP_SFm*AP_SFm);
      AP_Tm2x=AP_Tm2y*(AP_a2*AP_SFm);
      AP_Tm2z=AP_Tm2y*(AP_b2*AP_SFm);
      //Finding change vector for touch points from initial touch start
      AP_T1Chgx=AP_Tm1x-AP_Ti1x; AP_T1Chgy=AP_Tm1y-AP_Ti1y; 
      AP_T1Chgz=AP_Tm1z-AP_Ti1z;
      AP_TMag=Math.sqrt(AP_T1Chgx*AP_T1Chgx+AP_T1Chgy*AP_T1Chgy
       +AP_T1Chgz*AP_T1Chgz);
      //and normalizing the vector, for both touch points
      AP_T1Chgx= AP_T1Chgx/AP_TMag; AP_T1Chgy= AP_T1Chgy/AP_TMag;
      AP_T1Chgz= AP_T1Chgz/AP_TMag; 
      AP_T2Chgx=AP_Tm2x-AP_Ti2x; AP_T2Chgy=AP_Tm2y-AP_Ti2y; 
      AP_T2Chgz=AP_Tm2z-AP_Ti2z;
      AP_TMag=Math.sqrt(AP_T2Chgx*AP_T2Chgx+AP_T2Chgy*AP_T2Chgy
       +AP_T2Chgz*AP_T2Chgz);
      AP_T2Chgx= AP_T2Chgx/AP_TMag; AP_T2Chgy= AP_T2Chgy/AP_TMag;
      AP_T2Chgz= AP_T2Chgz/AP_TMag; 
      
      //Checking a minimum (1 deg.) angle between the two Change vectors, before doing cross product
      if (Math.abs(AP_T1Chgx*AP_T2Chgx+AP_T1Chgy*AP_T2Chgy+AP_T1Chgz*AP_T2Chgz)<Math.cos(Math.PI/180))
      {
       //Finding rotation axis as the cross-product of change vectors of 1/2
       AP_TRotx=AP_T1Chgy*AP_T2Chgz-AP_T1Chgz*AP_T2Chgy;
       AP_TRoty=AP_T1Chgz*AP_T2Chgx-AP_T1Chgx*AP_T2Chgz;
       AP_TRotz=AP_T1Chgx*AP_T2Chgy-AP_T1Chgy*AP_T2Chgx;

       //Finding the magnitude of Rotation vector and normalizing
       AP_TMag=Math.sqrt(AP_TRotx*AP_TRotx+AP_TRoty*AP_TRoty
        +AP_TRotz*AP_TRotz);
       AP_TRotx= AP_TRotx/AP_TMag; AP_TRoty= AP_TRoty/AP_TMag; 
       AP_TRotz= AP_TRotz/AP_TMag;

       //Finding vector dot product value of Rotation axis with the two Touch vectgors
       AP_CRT1=AP_TRotx*AP_Ti1x+AP_TRoty*AP_Ti1y+AP_TRotz*AP_Ti1z;
       AP_CRT2=AP_TRotx*AP_Ti2x+AP_TRoty*AP_Ti2y+AP_TRotz*AP_Ti2z;

       //Considering the touch point which is farthest from the Rot axis
       //If Touch vector 1 is the farthest
       if (Math.abs(AP_CRT1)<Math.abs(AP_CRT2))
       {
        //Calculation of rotation angle from the spherical triangle formed
        //by rotation axis and the touch point initial and moved
        AP_CosVal=(AP_Ti1x*AP_Tm1x+AP_Ti1y*AP_Tm1y+AP_Ti1z*AP_Tm1z
          -AP_CRT1*AP_CRT1)/(1-AP_CRT1*AP_CRT1);
        //Considering a minimum (1 deg.) as criteria for rotation threshold
        if (Math.abs(AP_CosVal)<Math.cos(Math.PI/180))
        {
         //Transformed Rotation angle(w) based on spherical triangle formed by 
         // rotation axis and the starting and current touch point of 1
         AP_TW=Math.acos(AP_CosVal);
         //picking the right sense of rotation axis, if clockwise rotation
         if ((AP_TRotx*(AP_Ti1y*AP_Tm1z-AP_Ti1z*AP_Tm1y)
          +AP_TRoty*(AP_Ti1z*AP_Tm1x-AP_Ti1x*AP_Tm1z)
          +AP_TRotz*(AP_Ti1x*AP_Tm1y-AP_Ti1y*AP_Tm1x))<0) AP_TW=-AP_TW;
         AP_PanStat=5;
        }
       }
       //When touch vector-2 is the farthest
       else
       {
        //Calculation of rotation angle from the spherical triangle formed
        //by rotation axis and the touch point initial and moved
        AP_CosVal=(AP_Ti2x*AP_Tm2x+AP_Ti2y*AP_Tm2y+AP_Ti2z*AP_Tm2z
          -AP_CRT2*AP_CRT2)/(1-AP_CRT2*AP_CRT2);
        if (Math.abs(AP_CosVal)<Math.cos(Math.PI/180))
        { 
         //Transformed Rotation angle(w) based on spherical triangle formed by 
         // rotation axis and the starting and current touch point of 1
         AP_TW=Math.acos(AP_CosVal);
         //picking the right sense of rotation axis, if clockwise rotation
         if ((AP_TRotx*(AP_Ti2y*AP_Tm2z-AP_Ti2z*AP_Tm2y)
          +AP_TRoty*(AP_Ti2z*AP_Tm2x-AP_Ti2x*AP_Tm2z)
          +AP_TRotz*(AP_Ti2x*AP_Tm2y-AP_Ti2y*AP_Tm2x))<0) AP_TW=-AP_TW;
         //status update. Note: zenith generally goes off-vertical in 2-touch pan 
         AP_PanStat=5;
        }
       }
       //TODO: Sometimes, two-touch movement does not produce expected rotations
       // and instead stalls. So, PanStat=7 not identifed correctly. Issue to be rectified. 
       if (AP_PanStat==5)
       {
        //Double touch panning status successful and noted
        AP_DTS=2;
        AP_qa0=Math.cos(-AP_TW/2); 
        AP_qR=Math.sin(-AP_TW/2);
        //Assocating the quaternion for additional live panning rotation
        AP_qa1=AP_qR*AP_TRotx; AP_qa2=AP_qR*AP_TRoty; AP_qa3=AP_qR*AP_TRotz;
        //and updating the new quaternion parameters
        AP_qn0=AP_qp0*AP_qa0-AP_qp1*AP_qa1-AP_qp2*AP_qa2-AP_qp3*AP_qa3;  
        AP_qn1=AP_qp0*AP_qa1+AP_qp1*AP_qa0+AP_qp2*AP_qa3-AP_qp3*AP_qa2;
        AP_qn2=AP_qp0*AP_qa2+AP_qp2*AP_qa0+AP_qp3*AP_qa1-AP_qp1*AP_qa3; 
        AP_qn3=AP_qp0*AP_qa3+AP_qp3*AP_qa0+AP_qp1*AP_qa2-AP_qp2*AP_qa1;
        //Updating the new magnification based on modified scaling factor
        AP_Mag=AP_MagB*AP_SFm;

        //Rendering the new scene for the calcuated 2-touch point panning
        AP_Render();
        AP_Tx=AP_Rxz; AP_Ty=AP_Ryz; AP_Tz=AP_Rzz;
        //Transformed Top/zenith point coordinates after (m)scaled panning
        AP_TTmx=AP_Rxz; AP_TTmy=AP_Ryz; AP_TTmz=AP_Rzz;
      
        //Magnitude of Y-Z projected T vector for finding rebound T/zenith point
        AP_TMag=Math.sqrt(AP_TTmy*AP_TTmy+AP_TTmz*AP_TTmz);
        AP_RTmx=0; AP_RTmy=AP_TTmy/AP_TMag; AP_RTmz=AP_TTmz/AP_TMag;
        //Checking and ensuring rebound T to lie in Y-Z plane upper hemisphere
        if (AP_RTmz<0) { AP_RTmz=0; if (AP_RTmy>0) AP_RTmy=1; else AP_RTmy=-1; }
        //Calculating the rebound (second) rotation axis and angle(W)
        // as cross-product of governing T/zenith vector (minimum rotation path)
        AP_RotIIx=AP_TTmy*AP_RTmz-AP_TTmz*AP_RTmy;
        AP_RotIIy=AP_TTmz*AP_RTmx-AP_TTmx*AP_RTmz;
        AP_RotIIz=AP_TTmx*AP_RTmy-AP_TTmy*AP_RTmx;
        AP_TMag=Math.sqrt(AP_RotIIx*AP_RotIIx+AP_RotIIy*AP_RotIIy
         +AP_RotIIz*AP_RotIIz);
        AP_RotIIx= AP_RotIIx/AP_TMag; AP_RotIIy= AP_RotIIy/AP_TMag; 
        AP_RotIIz= AP_RotIIz/AP_TMag;
        AP_RotIIW=Math.acos(AP_TTmx*AP_RTmx+AP_TTmy*AP_RTmy+AP_TTmz*AP_RTmz);
       }
      }
     } 
     //If greatest of two quadration equation is negative, then not solvable!
     else { }
    }
    //If the quadratic equation determinent is negative, then not solvable!
    else { }
   } 
   //If touch point status in not 2 or DTS inactive, then stop 2-touch panning
   else AP_TP=-1;
  }
 });
 //Call function to accordingly start/pause the auto rotation (AnimPlay)
 AP_Can.addEventListener('touchend', function(AP_Ev)
 {
  var AP_Time_final=Date.now();
  AP_Ev.stopPropagation(); AP_Ev.preventDefault(); 
  if (AP_TP==1)
  {
   { 
    document.getElementById('Output').style.cursor='default';
    AP_End(); AP_TP=0; 
   }
   AP_MD=0;
   if ( (AP_Touch_Dbclk==1) && ((AP_Time_final-AP_Time_first)<500) )
   {
    AP_Touch_Dbclk=2;
    AP_StartPosition();
    AP_Touch_Dbclk=0;
   }
  }
  if (AP_TP==2)
  {
   document.getElementById('Output').style.cursor='not-allowed'; 
   if (AP_DTS==2) AP_DoubleTouchEnd();
   //AP_TP=-1; AP_DTD=0;
  }
  if (AP_Ev.touches.length==0) 
  { 
   document.getElementById('Output').style.cursor='default'; AP_TP=0;
   if (AP_PanStat<4) AP_PanStat=0;
   AP_MD=0; AP_DTS=0; AP_Render();
  }
 // if (AP_TP==-1) { document.getElementById('Output').style.cursor='not-allowed'; AP_Render(); }
 });
 AP_Can.addEventListener('touchleave', function(AP_Ev)
 { 
  AP_Ev.stopPropagation(); AP_Ev.preventDefault();
  if (AP_MD==2) AP_End();
  if (AP_DTS==2) AP_DoubleTouchEnd();
  AP_AnimPlay=0; AP_MD=0; AP_TP=0; AP_DTS=0;
  document.getElementById('Output').style.cursor='default';
 });
 
 AP_choosefile.addEventListener('change',function()
 {
  var AP_file=AP_choosefile.files[0];
  if (AP_file)
  {
   var AP_FileImg;
   var AP_img_chosen=document.createElement('img');
   var AP_filereader=new FileReader();
   AP_filereader.onload=(function(AP_FileImg)
   {
    return function() 
    {
     AP_FileImg.src=this.result; AP_FileImg.onload=function() 
     {
      AP_InputImage=AP_FileImg; AP_LegDisp=false; AP_InputResizeRender();
     };
    };
   })(AP_img_chosen);
   AP_filereader.readAsDataURL(AP_file);  
  }
 });

 //function call to check the input image file size, and call routines to 
 // read the input image and then render based on the canvas size                          
 function AP_InputResizeRender() 
 {
  //If the input image size/resolution is too detailed to be handled by
  // the alloted memory size of array
  if (AP_InputImage.height*AP_InputImage.width>AP_Max_Pixel_Size)
  { alert("Input image size too big!"); return; }
  //otherwise read the input data of the equirectangular panorama image,
  // execute ResizeRender and start Animation play with PauseResume
  else 
  {
   AP_InputData();
   AP_ResizeRender(); 
   AP_AnimPlay=1; AP_PauseResume();
  }
 }

 //function call to get the input image data using canvas method, and
 // record the pixel data with ACCUPAN watermark
 function AP_InputData()
 {
  //Note the Interpretation of angle coordinates in the input image and its
  // implementation in the program:
  //The polar angle theta ranges from 0 to PI, from top to bottom of the input
  // image, i.e from zenith to nadir of the image scene
  //The Azimuth angle Phi is considered to range between +PI at left to -PI 
  // at right, of the input rectilinear panorama image.
 
  //Size of Input Image Height and Width
  var AP_SIH, AP_SIW;
  //variable for tracking the Type of equivalent Cube Map image data, 
  // (considering h_v as its ref axis being parallel to)
  //Variable for storing the array image Data and using the pixel RGB color 
  // details of the canvas corresponding to the Input panoramic image content
  var AP_ImgId=[], AP_PixI=[];
  //Set of factors/terms used for reducing the computation cycles, repetition
  // of calculation 
  var AP_Term1, AP_Term2, AP_Term3, AP_Term4, AP_Term5, AP_Term6, AP_Term7;
  //Integer counter of pixel coordinate data: i from bottom to top, and j
  // from left to right in the Cube map data format
  var AP_iC, AP_jC;
  //Horizontal and Vertical geometrical coordinates of the cube map of size
  // AP_CMS*AP_CMS, so the pixel centre point value lie in the range [-1,1]
  var AP_hC, AP_vC;
  //3D geometrical coordinate (in perpendicular direction) of the specific 
  // pixel point of the input Cube map format
  var AP_pIC;
  //Cube Map Type in Input 1-front side (middle of input image, x_z) , 
  // 2-back side (broken end region halves of input image -x_z), 
  // 3-right side (-y_z), 4-left side (y_z), 5-top side (x_-y) and
  // 6-bottom side (x_y) cube portions of the panorama input image
  var AP_CMTI;
  //variables denoting the calculated polar angle and the azimuth angle
  // for the pixel point considered in any of the six cube map zones 
  var AP_Theta, AP_Phi, AP_Phi1;
 
  //Declaration of Legend/Label overall Width, Font width-height, 
  // half-thickness of outer-white and inner black font region, and Font-height
  var AP_LegW, AP_LegH, AP_Legw, AP_Legh, AP_LegR;
  //Declaration of the 4 circular arc poritons of the font, through their 
  // centers, radius, start and finish arc azimuth angle wrt horizontal/+j, 
  // in ACCUPAN (0+1+1+1+1+0+0)
  //Definition/choice of (j-horizontal-right,i-vertical-up) coordinates of the
  // character bottom base centre for the 7 characters of ACCUPAN
  var AP_LegChari=[], AP_LegCharj=[];
  //Declaration of the 14 line segment poritons of the font, through their
  // end vertex coordinates in the characters of ACCUPAN (3+0+0+2+3+3+3)
  var AP_LegLineP1i=[], AP_LegLineP1j=[], AP_LegLineP2i=[], AP_LegLineP2j=[];
  //Declaration of the 14 line parameters: difference in j-horizontal & 
  // i-vertical coordinates between the two end points P12, and their distance
  var AP_LegLineP12i=[], AP_LegLineP12j=[], AP_LegLineD=[];
 
  //Declaration of the radius for the inner and outer arc portions for the 
  // outer white boundary drawing of the font
  var AP_LegCirCeni=[], AP_LegCirCenj=[], AP_LegCirRad=[];
  var AP_LegCirAngIni=[], AP_LegCirAngFin=[];
  //Declaration of the radius for the inner and outer arc portions for the
  // inner black boundary drawing of the font
  var AP_LegCirR1=[], AP_LegCirR2=[], AP_LegCirr1=[], AP_LegCirr2=[];
  
  var AP_LegCirP1j=[], AP_LegCirP1i=[], AP_LegCirP2j=[], AP_LegCirP2i=[];
  //loop counter for each of the 14 lines or the 4 arcs to be checked, to know
  // if it covers the considered pixel in the cube map image array 
  var AP_kC;
  //Check result for the considere pixel, 0-not covered by the font, 1-covered
  // within the outer white boundary region of font, 2-covered also within the
  // inner black region of font
  var AP_LegChk;
  var AP_IndCI;
 
  //Progress kind of mouse pointer status, while the input image data is 
  // being processed for calculating the output scene image for rendering
  document.body.style.cursor='progress'; 
 
  //Noting the size of canvas height and width for re-initializing again later
  AP_SOH=AP_Can.height;  AP_SOW=AP_Can.width;
  //Notingthe size (Height, Width) from the input image, and temporarily 
  // relating it to the canvas size for the purpose of retrieve & storing the
  // input image data pixel color values 
  AP_SIH=AP_InputImage.height; AP_Can.height=AP_SIH;
  AP_SIW=AP_InputImage.width; AP_Can.width=AP_SIW;
  //Temporarily relating the input image to that of the canvas region
  AP_Ctx.drawImage(AP_InputImage,0,0);
  //Getting the image array data and the pixel color data array values of the
  // input image
  AP_ImgId=AP_Ctx.getImageData(0,0,AP_SIW,AP_SIH); AP_PixI=AP_ImgId.data;
  //After noting the input image pixel details, reverting back the canvas size
  // to the actual size noted earlier
  AP_Can.height=AP_SOH; AP_Can.width=AP_SOW;
  //The Input size of width*height region getting distributed among the six
  // cube map regions, and so determining the Cube Map Size, and to be in even
  // form (to prevent denominator zero calculation error situations)
  AP_CMS=Math.floor(Math.sqrt(AP_SIH*AP_SIW/6)); if (AP_CMS%2==1) AP_CMS++;
  //setting the scene magnification parameter at 1, zoom inactive, auto-rotate
  // step angle, mouse-down/touch entry off
  AP_Mag=1.0; AP_Zoom=0; AP_RotWs=Math.PI/720;
  //Setting the quaternion paramers to unity, for staring scene orienation
  // looking at the centre of the equirectangular image format
  AP_qn0=1.0; AP_qn1=0; AP_qn2=0; AP_qn3=0;
  //Quaternion parameters for additional step rotations. By default, the 
  // view turns rightward, so wrt the current view, the input reference 
  // rotates in opposite sense
  AP_qa0=Math.cos(-AP_RotWs/2);
  AP_qa1=0.0; AP_qa2=0.0; AP_qa3=Math.sin(-AP_RotWs/2); 
  //set of terms for reducing the compuatation cycle
  //The cube map projection domain is about [-1,1] in horizonal/vertical
  // direction, spread over CMS size; the associated step width for next
  // pixel calculation
  AP_Term1=2/AP_CMS;
  //The starting horizontal-left-most/vertical-bottom-most pixel's 
  // gnomonic projection coordinate of the cube maps
  AP_Term2=-1+(1/AP_CMS);
  //The total pixel color byte size of a single cube map region
  AP_Term3=3*AP_CMS*AP_CMS;
  //Jump back (in array bytes location) for next pixel of first cubem map
  // after completing all 6 cube map zone similar pixel calculation
  AP_Term4=3-6*AP_Term3;
  //Factor that converts vertical input pixel location to the proportionate
  // polar angle 
  AP_Term5=AP_SIH/Math.PI;
  //Factor that converts horizontal input pixel location to the proportionate
  // azimuth angle 
  AP_Term6=-0.5*AP_SIW/Math.PI;
  //Index value of the pixel in the cube map 
  AP_IndCI=0;
  //The starting vertical geometrical coordinate of pixel centre,
  // corresponding to the bottom row of cube map
  AP_vC=AP_Term2;
  //offset factor in the input file, as the azimuth angle of zero is situated
  // at middle line of the input image width
  AP_Term7=0.5*AP_SIW;
  
  //for each of the pixel row position of the cube map, bottom to top
  //equivalently, vertical coordinates value change from AP_Term2 to -AP_Term2 
  // at step value of AP_Term1
  for (AP_iC=0;AP_iC<AP_CMS;AP_iC++,AP_vC+=AP_Term1)
  {
   AP_hC=AP_Term2;
   //for each of the pixel volume position of the cube map, left to right
   //equivalently, horizontal coordinates value change from AP_Term2 to 
   // -AP_Term2 at step value of AP_Term1
   for (AP_jC=0;AP_jC<AP_CMS;AP_jC++,AP_hC+=AP_Term1)
   {
    //The perpendicular (projection direction) coordinate calculation from 
    // the pixel position gnomonic projection coordinates
    AP_pIC=Math.sqrt(1/(1+AP_hC*AP_hC+AP_vC*AP_vC));
    //loop calculation to associate the considered pixel in each of the 
    // cube map types: 1-front, 2-back, 3-right, 4-left, 5-top, 6-bottom
    //The horizontal-right/vertical-up directions of 1-6 Cubemaps respectively
    // correspond to x/z, -x/z, -y/z, y/z, x/-y and x/y
    //The polar and azimuth angles calculated accordingly and minimizing
    // repeat calculation, as much as possible
    for (AP_CMTI=1;AP_CMTI<=6;AP_CMTI++)
    {
     switch(AP_CMTI)
     {
      case 1: 
      {
       AP_Theta=Math.acos(AP_vC*AP_pIC);
       AP_Phi=Math.atan(Math.abs(AP_hC));
       if (AP_hC>0) AP_Phi=-AP_Phi; AP_Phi1=AP_Phi; break; 
      }
      case 2:
      {
       if (AP_hC<0) AP_Phi=-Math.PI+AP_Phi; else AP_Phi=Math.PI+AP_Phi; break; 
      }
      case 3: { AP_Phi=AP_Phi1-Math.PI/2.0; break; }
      case 4: { AP_Phi+=Math.PI; break; }
      case 5:
      {
       AP_Theta=Math.acos(AP_pIC); 
       //Note: The inverse tan function gives result in the range [0,PI] and
       // azimuth angle accordingly adjusted for I and IV quadrant regions
       AP_Phi=Math.atan(AP_hC/AP_vC);
       if (AP_vC>0) AP_Phi=-Math.PI+AP_Phi; break;
      }
      case 6:
      {
       AP_Theta=Math.PI-AP_Theta; 
       if (AP_Phi<0) AP_Phi=-Math.PI-AP_Phi; else AP_Phi=Math.PI-AP_Phi; break; 
      }
     }
     //Calculating the Input image pixel array element location based on 
     // polar and azimuth angles
     AP_IndI=4*(AP_SIW*Math.floor(AP_Theta*AP_Term5)
     +Math.floor(AP_Phi*AP_Term6+AP_Term7));
     //Assigning the computed input pixel color values to the cube map pixel
     // value, and then incrementing to the associated pixel location of the
     // next cube map
     AP_PixIC[AP_IndCI]=AP_PixI[AP_IndI]; 
     AP_PixIC[AP_IndCI+1]=AP_PixI[AP_IndI+1]; 
     AP_PixIC[AP_IndCI+2]=AP_PixI[AP_IndI+2]; AP_IndCI+=AP_Term3;
    }
    //Reinitalizing back to the next pixel location of the first cube map
    AP_IndCI+=AP_Term4;
   }
  }
 
  AP_LegW=(AP_CMS/3); AP_Legw=(2*AP_LegW/(3*7));
  AP_Legh=(5*AP_Legw/3); AP_LegR=(AP_Legw/5); 
  AP_Legr=0.5*AP_LegR; AP_LegH=AP_Legh+2*AP_LegR;
  
  AP_LegCharj[0]=0.5*(AP_CMS)-3.0*AP_LegW/7;
  AP_LegChari[0]=0.5*(AP_CMS)-0.5*AP_Legh;
  AP_LegCharj[1]=0.5*(AP_CMS)-2.15*AP_LegW/7; 
  AP_LegChari[1]=0.5*(AP_CMS)-0.5*AP_Legh;
  AP_LegCharj[2]=0.5*(AP_CMS)-1.15*AP_LegW/7; 
  AP_LegChari[2]=0.5*(AP_CMS)-0.5*AP_Legh;
  AP_LegCharj[3]=0.5*(AP_CMS)+0.0001*AP_LegW/7; 
  AP_LegChari[3]=0.5*(AP_CMS)-0.5*AP_Legh; 
  AP_LegCharj[4]=0.5*(AP_CMS)+1*AP_LegW/7; 
  AP_LegChari[4]=0.5*(AP_CMS)-0.5*AP_Legh;
  AP_LegCharj[5]=0.5*(AP_CMS)+1.85*AP_LegW/7; 
  AP_LegChari[5]=0.5*(AP_CMS)-0.5*AP_Legh;
  AP_LegCharj[6]=0.5*(AP_CMS)+2.85*AP_LegW/7; 
  AP_LegChari[6]=0.5*(AP_CMS)-0.5*AP_Legh;
 
  //First Letter A
  AP_LegLineP1j[0]=AP_LegCharj[0]-0.5*AP_Legw; AP_LegLineP1i[0]=AP_LegChari[0];
  AP_LegLineP2j[0]=AP_LegCharj[0]; AP_LegLineP2i[0]=AP_LegChari[0]+AP_Legh;
  AP_LegLineP1j[1]=AP_LegCharj[0]+0.5*AP_Legw; AP_LegLineP1i[1]=AP_LegChari[0];
  AP_LegLineP2j[1]=AP_LegCharj[0];  AP_LegLineP2i[1]=AP_LegChari[0]+AP_Legh;
  AP_LegLineP1j[2]=AP_LegCharj[0]-0.35*AP_Legw; 
  AP_LegLineP1i[2]=AP_LegChari[0]+0.3*AP_Legh;
  AP_LegLineP2j[2]=AP_LegCharj[0]+0.35*AP_Legw; 
  AP_LegLineP2i[2]=AP_LegChari[0]+0.3*AP_Legh;
  //Letter U
  AP_LegLineP1j[3]=AP_LegCharj[3]-0.5*AP_Legw; 
  AP_LegLineP1i[3]=AP_LegChari[3]+0.5*AP_Legw;
  AP_LegLineP2j[3]=AP_LegCharj[3]-0.5*AP_Legw;
  AP_LegLineP2i[3]=AP_LegChari[3]+AP_Legh;
  AP_LegLineP1j[4]=AP_LegCharj[3]+0.5*AP_Legw;
  AP_LegLineP1i[4]=AP_LegChari[3]+0.5*AP_Legw;
  AP_LegLineP2j[4]=AP_LegCharj[3]+0.5*AP_Legw;
  AP_LegLineP2i[4]=AP_LegChari[3]+AP_Legh;
  //Letter P
  AP_LegLineP1j[5]=AP_LegCharj[4]-0.5*AP_Legw; 
  AP_LegLineP1i[5]=AP_LegChari[4];
  AP_LegLineP2j[5]=AP_LegCharj[4]-0.5*AP_Legw; 
  AP_LegLineP2i[5]=AP_LegChari[4]+AP_Legh;
  AP_LegLineP1j[6]=AP_LegCharj[4]-0.5*AP_Legw; 
  AP_LegLineP1i[6]=AP_LegChari[4]+0.5*AP_Legh;
  AP_LegLineP2j[6]=AP_LegCharj[4]+0.5*AP_Legw-0.25*AP_Legh; 
  AP_LegLineP2i[6]=AP_LegChari[4]+0.5*AP_Legh;
  AP_LegLineP1j[7]=AP_LegCharj[4]-0.5*AP_Legw; 
  AP_LegLineP1i[7]=AP_LegChari[4]+AP_Legh;
  AP_LegLineP2j[7]=AP_LegCharj[4]+0.5*AP_Legw-0.25*AP_Legh; 
  AP_LegLineP2i[7]=AP_LegChari[4]+AP_Legh;
  //Second letter A
  AP_LegLineP1j[8]=AP_LegCharj[5]-0.5*AP_Legw; 
  AP_LegLineP1i[8]=AP_LegChari[5];
  AP_LegLineP2j[8]=AP_LegCharj[5]; 
  AP_LegLineP2i[8]=AP_LegChari[5]+AP_Legh;
  AP_LegLineP1j[9]=AP_LegCharj[5]+0.5*AP_Legw; 
  AP_LegLineP1i[9]=AP_LegChari[5];
  AP_LegLineP2j[9]=AP_LegCharj[5]; AP_LegLineP2i[9]=AP_LegChari[5]+AP_Legh;
  AP_LegLineP1j[10]=AP_LegCharj[5]-0.35*AP_Legw; 
  AP_LegLineP1i[10]=AP_LegChari[5]+0.3*AP_Legh;
  AP_LegLineP2j[10]=AP_LegCharj[5]+0.35*AP_Legw;
  AP_LegLineP2i[10]=AP_LegChari[5]+0.3*AP_Legh;
  //Letter N
  AP_LegLineP1j[11]=AP_LegCharj[6]-0.5*AP_Legw;
  AP_LegLineP1i[11]=AP_LegChari[6];
  AP_LegLineP2j[11]=AP_LegCharj[6]-0.5*AP_Legw;
  AP_LegLineP2i[11]=AP_LegChari[6]+AP_Legh;
  AP_LegLineP1j[12]=AP_LegCharj[6]-0.5*AP_Legw; 
  AP_LegLineP1i[12]=AP_LegChari[6]+AP_Legh;
  AP_LegLineP2j[12]=AP_LegCharj[6]+0.5*AP_Legw; 
  AP_LegLineP2i[12]=AP_LegChari[6];
  AP_LegLineP1j[13]=AP_LegCharj[6]+0.5*AP_Legw; 
  AP_LegLineP1i[13]=AP_LegChari[6];
  AP_LegLineP2j[13]=AP_LegCharj[6]+0.5*AP_Legw; 
  AP_LegLineP2i[13]=AP_LegChari[6]+AP_Legh;
  
  for (AP_iC=0;AP_iC<14;AP_iC++)
  {
   AP_LegLineP12j[AP_iC]=AP_LegLineP2j[AP_iC]-AP_LegLineP1j[AP_iC];
   AP_LegLineP12i[AP_iC]=AP_LegLineP2i[AP_iC]-AP_LegLineP1i[AP_iC];
   AP_LegLineD[AP_iC]=Math.sqrt(AP_LegLineP12j[AP_iC]*AP_LegLineP12j[AP_iC]
    +AP_LegLineP12i[AP_iC]*AP_LegLineP12i[AP_iC]);
  }
 
  //Letter C, center (j,i) coordinates, and the radius of the arc centre line,
  // and the start/end angles
  AP_LegCirCenj[0]=AP_LegCharj[1]-0.5*AP_Legw+0.5*AP_Legh; 
  AP_LegCirCeni[0]=AP_LegChari[1]+0.5*AP_Legh;
  AP_LegCirRad[0]=0.5*AP_Legh;
  AP_LegCirAngIni[0]=60.0*Math.PI/180; AP_LegCirAngFin[0]=300.0*Math.PI/180;
  //second Letter C, center (j,i) coordinates, and the radius of the arc 
  // centre line, and the start/end angles
  AP_LegCirCenj[1]=AP_LegCharj[2]-0.5*AP_Legw+0.5*AP_Legh; 
  AP_LegCirCeni[1]=AP_LegChari[2]+0.5*AP_Legh;
  AP_LegCirRad[1]=0.5*AP_Legh;
  AP_LegCirAngIni[1]=60.0*Math.PI/180; AP_LegCirAngFin[1]=300.0*Math.PI/180;
  //Letter U, center (j,i) coordinates, and the radius of the arc centre line, 
  // and the start/end angles
  AP_LegCirCenj[2]=AP_LegCharj[3]; AP_LegCirCeni[2]=AP_LegChari[3]+0.5*AP_Legw;
  AP_LegCirRad[2]=0.5*AP_Legw;
  AP_LegCirAngIni[2]=180.0*Math.PI/180; AP_LegCirAngFin[2]=360*Math.PI/180;
  //Letter P, center (j,i) coordinates, and the radius of the arc centre line, 
  // and the start/end angles from 90 to 270 reverse sense
  AP_LegCirCenj[3]=AP_LegCharj[4]+0.5*AP_Legw-0.25*AP_Legh;
  AP_LegCirCeni[3]=AP_LegChari[4]+0.75*AP_Legh;
  AP_LegCirRad[3]=0.25*AP_Legh;
  AP_LegCirAngIni[3]=270*Math.PI/180; AP_LegCirAngFin[3]=90*Math.PI/180;
  //calculating the outer & inner radius of the outer-white and inner-black 
  // boundary circular arcs and its end point coordinates, for C,C,U,P letters
  for (AP_iC=0;AP_iC<4;AP_iC++)
  {
   AP_LegCirR1[AP_iC]=AP_LegCirRad[AP_iC]-AP_LegR;
   AP_LegCirR2[AP_iC]=AP_LegCirRad[AP_iC]+AP_LegR;
   AP_LegCirr1[AP_iC]=AP_LegCirRad[AP_iC]-AP_Legr;
   AP_LegCirr2[AP_iC]=AP_LegCirRad[AP_iC]+AP_Legr;
   AP_LegCirP1j[AP_iC]=AP_LegCirCenj[AP_iC]+Math.cos(AP_LegCirAngIni[AP_iC])
    *AP_LegCirRad[AP_iC];
   AP_LegCirP1i[AP_iC]=AP_LegCirCeni[AP_iC]+Math.sin(AP_LegCirAngIni[AP_iC])
    *AP_LegCirRad[AP_iC];
   AP_LegCirP2j[AP_iC]=AP_LegCirCenj[AP_iC]+Math.cos(AP_LegCirAngFin[AP_iC])
    *AP_LegCirRad[AP_iC];
   AP_LegCirP2i[AP_iC]=AP_LegCirCeni[AP_iC]+Math.sin(AP_LegCirAngFin[AP_iC])
    *AP_LegCirRad[AP_iC];
  }

  //checking for each of the pixel in the central region of the cube map of
  // size AP_LegW x AP_LegH
  for (AP_iC=Math.floor(0.5*AP_CMS-0.5*AP_LegH);AP_iC<=Math.floor(0.5*AP_CMS
   +0.5*AP_LegH);AP_iC++)
  {
   for (AP_jC=Math.floor(0.5*AP_CMS-0.5*AP_LegW);AP_jC<=Math.floor(0.5*AP_CMS
    +0.5*AP_LegW);AP_jC++)
   {
    AP_LegChk=0; //pixel assumed to be not covered by any of the font to start
    // with checking for each of the fourteen lines of font
    for (AP_kC=0;AP_kC<14;AP_kC++)
    {
     //condition check if the distance of the pixel from the (extended) line
     // is within a magnitude value of AP_LegR
     if ( (Math.abs(-(AP_jC-AP_LegLineP1j[AP_kC])*AP_LegLineP12i[AP_kC]
      +(AP_iC-AP_LegLineP1i[AP_kC])*AP_LegLineP12j[AP_kC]))
      <=(AP_LegLineD[AP_kC]*AP_LegR))
     {
      //Resolved distance of the vector joining the pixel to P1, along the
      //  line P12 (should be > than zero and < than squared distance of P12)
      AP_Term1=(AP_jC-AP_LegLineP1j[AP_kC])*AP_LegLineP12j[AP_kC]
       +(AP_iC-AP_LegLineP1i[AP_kC])*AP_LegLineP12i[AP_kC];
      //Terms finding the distance of the pixel from the end coordinates P1,
      // P2 (should be < than the squared radius/semi-thickness of font)
      AP_Term2=(AP_jC-AP_LegLineP1j[AP_kC])*(AP_jC-AP_LegLineP1j[AP_kC])
       +(AP_iC-AP_LegLineP1i[AP_kC])*(AP_iC-AP_LegLineP1i[AP_kC]);
      AP_Term4=(AP_jC-AP_LegLineP2j[AP_kC])*(AP_jC-AP_LegLineP2j[AP_kC])
       +(AP_iC-AP_LegLineP2i[AP_kC])*(AP_iC-AP_LegLineP2i[AP_kC]);
      //condition checking for pixel to be within the white bounding line
      // regions of the font
      if ( ( (AP_Term1>=0) && (AP_Term1<=(AP_LegLineD[AP_kC]
        *AP_LegLineD[AP_kC])) ) || (AP_Term2<=AP_LegR*AP_LegR)
        || (AP_Term4<=AP_LegR*AP_LegR) )
      {
       //if the pixel has already not satisfied the inner font condition
       if (AP_LegChk!=2) AP_LegChk=1; 
       //similar condition check to know if the distance of the pixel
       // from (extended) line is within the magnitud of AP_Legr
       if ( (Math.abs(-(AP_jC-AP_LegLineP1j[AP_kC])
        *AP_LegLineP12i[AP_kC]+(AP_iC-AP_LegLineP1i[AP_kC])
        *AP_LegLineP12j[AP_kC]))<=(AP_LegLineD[AP_kC]*AP_Legr))
       {
        //condition checking for pixel to be within the black bounding 
        // line regions of the font
        if ( ( (AP_Term1>=0) && (AP_Term1<=(AP_LegLineD[AP_kC]
         *AP_LegLineD[AP_kC])) ) || (AP_Term2<=AP_Legr*AP_Legr) 
         || (AP_Term4<=AP_Legr*AP_Legr) )
        {
         AP_LegChk=2;
        }
       }
      }
     }
    }
    //Repeating the checking for each of the four circular arcs
    for (AP_kC=0;AP_kC<4;AP_kC++)
    {
     //squared distance of the pixel from the arc centre
     AP_Term1=(AP_jC-AP_LegCirCenj[AP_kC])*(AP_jC-AP_LegCirCenj[AP_kC])
      +(AP_iC-AP_LegCirCeni[AP_kC])*(AP_iC-AP_LegCirCeni[AP_kC]);
     //if the squared distance is within the squared value of the outer and
     // inner radius of the outer bounding white circular zone
     if ( (AP_Term1>(AP_LegCirR1[AP_kC]*AP_LegCirR1[AP_kC])) && 
      (AP_Term1<(AP_LegCirR2[AP_kC]*AP_LegCirR2[AP_kC])) )
     {
      //calculation of the azimuth angle made by pixel wrt the arc centre 
      // and positive horizontal axis, by inverse cos function and correcting
      // it to full (0,2*PI) range
      AP_Term2=Math.acos((AP_jC-AP_LegCirCenj[AP_kC])/Math.sqrt(AP_Term1)); 
      if ((AP_iC-AP_LegCirCeni[AP_kC])<0) AP_Term2=2*Math.PI-AP_Term2;
      //Terms finding the distance of the pixel from the end coordinates P1,P2
      // of the arc(should be <than the squared radius/semi-thickness of font)
      AP_Term4=(AP_jC-AP_LegCirP1j[AP_kC])*(AP_jC-AP_LegCirP1j[AP_kC])
       +(AP_iC-AP_LegCirP1i[AP_kC])*(AP_iC-AP_LegCirP1i[AP_kC]);
      AP_Term5=(AP_jC-AP_LegCirP2j[AP_kC])*(AP_jC-AP_LegCirP2j[AP_kC])
       +(AP_iC-AP_LegCirP2i[AP_kC])*(AP_iC-AP_LegCirP2i[AP_kC]);
      //checking if the pixel azimuhth angle is within the expected range of 
      // circular arc azimuth values, or is within the outer radius distance      
      if ( ((AP_Term2-AP_LegCirAngIni[AP_kC])*(AP_Term2-AP_LegCirAngFin[AP_kC])
       *(AP_LegCirAngFin[AP_kC]-AP_LegCirAngIni[AP_kC])<0) || 
       (AP_Term4<=AP_LegR*AP_LegR) || (AP_Term5<= AP_LegR*AP_LegR) )
      {
       //if the pixel already not satisfied the inner font bounding condition
       if (AP_LegChk!=2) AP_LegChk=1; 
       //similar condition check to know if the distance of the pixel from 
       // the circular zone is within the magnitud of AP_Legr
       if ( (AP_Term1>(AP_LegCirr1[AP_kC]*AP_LegCirr1[AP_kC])) && 
        (AP_Term1<(AP_LegCirr2[AP_kC]*AP_LegCirr2[AP_kC])) )
       {
        //And further, if the pixel is within the expected azimuth angle
        // zone or within the inner radius distance condition
        if ( ((AP_Term2-AP_LegCirAngIni[AP_kC])*(AP_Term2-AP_LegCirAngFin[AP_kC])
         *(AP_LegCirAngFin[AP_kC]-AP_LegCirAngIni[AP_kC])<0) || 
         (AP_Term4<=AP_Legr*AP_Legr) || (AP_Term5<=AP_Legr*AP_Legr) )
        {
         AP_LegChk=2;
        }
       }
      }
     }
    }
   
    if (AP_LegChk>0)
    {
     //Index value in the first cube map zone
     AP_IndCI=3*(AP_CMS*AP_iC+AP_jC);
     for (AP_CMTI=1;AP_CMTI<=6;AP_CMTI++)
     {
      //If within the inner black zone, then the pixel mid-averaged/halved
      // with the original RGB value of the pixel
      if (AP_LegChk==2)
      {        
       AP_PixIC[AP_IndCI]=Math.floor(0.5*(AP_PixIC[AP_IndCI]));
       AP_PixIC[AP_IndCI+1]=Math.floor(0.5*(AP_PixIC[AP_IndCI+1]));
       AP_PixIC[AP_IndCI+2]=Math.floor(0.5*(AP_PixIC[AP_IndCI+2]));
       //AP_PixIC[AP_IndCI]=0; AP_PixIC[AP_IndCI+1]=0; AP_PixIC[AP_IndCI+2]=0;
      }
      //when within the outer white zone, then the pixel mid-averaged with
      // the original RGB value of the pixel
      else 
      {
       AP_PixIC[AP_IndCI]=Math.floor(0.5*(AP_PixIC[AP_IndCI]+255));
       AP_PixIC[AP_IndCI+1]=Math.floor(0.5*(AP_PixIC[AP_IndCI+1]+255));
       AP_PixIC[AP_IndCI+2]=Math.floor(0.5*(AP_PixIC[AP_IndCI+2]+255));
      }
      //repeating the pixel assignment of the legend font for next cube map
      AP_IndCI+=AP_Term3; 
     }
    }
   }
  }
  document.getElementById('Output').style.cursor='default';
 }

 //Function call upon cahange of output canvas region size within the web page 
 function AP_ResizeRender()
 {
  //Considering the limiting minimum size of window width/height to assign
  // the canvas width, height values
  if ( ((screen.width==window.innerWidth) && (screen.height==window.innerHeight)) 
   || (AP_FullScreenOn) )
  {
   AP_FullScreenOn=true;
   AP_SOW=screen.width;
   AP_SOH=screen.height;
  }
  else
  {
   AP_FullScreenOn=false;
   AP_SOW=window.innerWidth-40; 
   AP_SOH=window.innerHeight-40;
   if (AP_SOH<200) AP_SOH=200;
  }
  AP_DevOrientActive=false;
  //Keeping the canvas size even to prevent possible zero division errors
  // of pixel center coordinate value
  if (AP_SOW%2==1) AP_SOW--;
  if (AP_SOH%2==1) AP_SOH--;
  AP_Can.width=AP_SOW; AP_Can.height=AP_SOH;
  //temporarily filling the canvas white, taking its pixel image data to
  // array for updating later
  AP_Ctx.fillStyle='#FFFFFF';  
  AP_Ctx.fillRect(0,0,AP_SOW,AP_SOH);
  AP_ImgOd=AP_Ctx.getImageData(0,0,AP_SOW,AP_SOH);
  AP_PixO=AP_ImgOd.data;
  //Setting the canvas rectangle for finding pixel events, pausing auto-play,
  // inactive setting of mouse-down/screen touch and Panning status 
  AP_Rect=AP_Can.getBoundingClientRect();
  AP_Anim_Play=0; AP_MD=0; AP_DTS=0; AP_TP=0; AP_PanStat=0;
  //Function call to calculate and render the output scene, and showing a
  // default cursor for mouse pointer
  AP_Render();
  document.body.style.cursor='default'; 
 }

 //function call for actual calculation of pixel colors of the canvas and 
 // rendering the output
 function AP_Render()
 {
  //Computation optimization terms: AP_IndCJump-jump index to next cube map
  // array, AP_FGPCM-factor for converting gnomonic projection coordinates to
  // cube map coordinates. Note: y component of cube map point coordinate is 1.
  var AP_IndCJump=3*AP_CMS*AP_CMS, AP_CMARS=3*AP_CMS, AP_FGPCM=0.5*AP_CMS;
  //The (x,z) value of the first cell (left-top) of output canvas, & to 
  // consider its offset from the (horizontal/vertical) canvas centre location.
  // Note: y=1
  var AP_OFCx, AP_OFCz; 
  //Offset factor for finding the cube map location from the coordinate 
  // converted index value (eg. cube map centre for centre (zero) coordinates) 
  var AP_CMCI=3*(AP_CMS*0.5*AP_CMS+0.5*AP_CMS);
  //Reference index value of the cell of the central point of the cube map
  // zones nos. 2 to 5
  var AP_CMCI2=AP_CMCI+AP_IndCJump, AP_CMCI3=AP_CMCI+2*AP_IndCJump;
  var AP_CMCI4=AP_CMCI+3*AP_IndCJump, AP_CMCI5=AP_CMCI+4*AP_IndCJump;
  var AP_CMCI6=AP_CMCI+5*AP_IndCJump;
  //Coordinates (xI,yI,zI) wrt initial panorama axis for the first cell 
  // (top-left) of the output canvas window
  var AP_xI, AP_yI, AP_zI;
  //shift in (xI,yI,zI) coordinates for unit incremental step change in
  // horiozontal/vertical cell of output canvas towards right/down
  var AP_xIvs, AP_yIvs, AP_zIvs, AP_xIhs, AP_yIhs, AP_zIhs;
  //pixel color index value of the output canvas, its maximum index value
  // and the horizontal position tracking in the output canvas array
  var AP_IndO, AP_IndO_Max=4*AP_SOH*AP_SOW, AP_JO;
  //Index value of the input cube map array in the associated cube map type
  // (initalized to be 0-dummy) for the considered output canvas pixel location
  var AP_IndCR, AP_CMTR=0;
  var AP_xIa, AP_yIa, AP_zIa;
  var AP_fs;
  var AP_ZNsx, AP_ZNsy;
  var AP_TextOut;
 
  //Calculating the resolved components of the current orthonormal vectors
  // Rx-Ry-Rz (HoriontalRight-ScreenInto-VerticalTop) wrt to starting panorama
  // axis from the updated qn. Essentially, the orthogonal elements of R got
  // by R'=qn.R.qn* quaternion multiplicative rule, qn* is conjugate of qn
  AP_Rxx=AP_qn0*AP_qn0+AP_qn1*AP_qn1-AP_qn2*AP_qn2-AP_qn3*AP_qn3;
  AP_Rxy=2*(AP_qn1*AP_qn2+AP_qn0*AP_qn3); 
  AP_Rxz=2*(AP_qn1*AP_qn3-AP_qn0*AP_qn2);
  AP_Ryx=2*(AP_qn1*AP_qn2-AP_qn0*AP_qn3);
  AP_Ryy=AP_qn0*AP_qn0-AP_qn1*AP_qn1+AP_qn2*AP_qn2-AP_qn3*AP_qn3;
  AP_Ryz=2*(AP_qn2*AP_qn3+AP_qn0*AP_qn1);
  AP_Rzx=2*(AP_qn1*AP_qn3+AP_qn0*AP_qn2); 
  AP_Rzy=2*(AP_qn2*AP_qn3-AP_qn0*AP_qn1); 
  AP_Rzz=AP_qn0*AP_qn0-AP_qn1*AP_qn1-AP_qn2*AP_qn2+AP_qn3*AP_qn3;
  //Noting the scaling factor and horizontal/vertical field of view, that 
  // converts screen coordinates to gnomonic projection distance coordinates
  AP_SF=AP_Mag*2*Math.tan(AP_HFOVS)/AP_SOW; 
  AP_FOVH=2*Math.atan(AP_SF*AP_SOW/2)*180/Math.PI;
  AP_FOVV=2*Math.atan(AP_SF*AP_SOH/2)*180/Math.PI;
  //Offset factor for converting the first cell (left-top) (& other elements)
  // of output canvas to the expected (x,y=1,z) coordinate (of the first CM 
  // zone notation)
  AP_OFCx=(0.5-0.5*AP_SOW)*AP_SF; AP_OFCz=(0.5*AP_SOH-0.5)*AP_SF; 
 
  //considering the first cell (top-left) of the output canvas, finding the
  // corresponding coordinates (xI,yI,zI)=(x y z)[R] wrt initial panorama axis 
  AP_xI=AP_OFCx*AP_Rxx+AP_Ryx+AP_OFCz*AP_Rzx; 
  AP_yI=AP_OFCx*AP_Rxy+AP_Ryy+AP_OFCz*AP_Rzy;
  AP_zI=AP_OFCx*AP_Rxz+AP_Ryz+AP_OFCz*AP_Rzz; 
  //finding the incremental change in (xI,yI,zI) caused by each step change in
  // horizontal/vertical position of pixel in output canvas towards right/down
  AP_xIvs=AP_SF*AP_Rzx; AP_yIvs=AP_SF*AP_Rzy; AP_zIvs=AP_SF*AP_Rzz; 
  AP_xIhs=AP_SF*AP_Rxx; AP_yIhs=AP_SF*AP_Rxy; AP_zIhs=AP_SF*AP_Rxz;

  //Loop calculation for all the output canvas array pixel from the first 
  // (top-left) point, J0 tracking the column (at each row) & Index jump 
  // of 4 data values
  for (AP_JO=0, AP_IndO=0; AP_IndO<AP_IndO_Max; AP_IndO+=4)
  {
   //Check if the cube map type (of previous loop) persists (1:+y, 2:-y,
   // 3:+x, 4:-x, 5:+z, 6:-z as the rojection direction), and calculate 
   // Index based on xI-yI-zI axis configuration
   switch(AP_CMTR)
   {
    case 1: 
    {
     if ( (AP_yI>Math.abs(AP_xI)) && (AP_yI>Math.abs(AP_zI)) ) 
     AP_IndCR=AP_CMCI+Math.floor(AP_zI/AP_yI*AP_FGPCM)*AP_CMARS
      +3*Math.floor(AP_xI/AP_yI*AP_FGPCM); 
     else AP_CMTR=0; break;
    }
    case 2: 
    {
     if ((AP_yI<-Math.abs(AP_xI)) && (AP_yI<-Math.abs(AP_zI)))
     AP_IndCR=AP_CMCI2+Math.floor(-AP_zI/AP_yI*AP_FGPCM)*AP_CMARS
      +3*Math.floor(AP_xI/AP_yI*AP_FGPCM);
     else AP_CMTR=0; break;
    }
    case 3:
    {
     if ((AP_xI>Math.abs(AP_yI)) && (AP_xI>Math.abs(AP_zI)))
     AP_IndCR=AP_CMCI3+Math.floor(AP_zI/AP_xI*AP_FGPCM)*AP_CMARS
      +3*Math.floor(-AP_yI/AP_xI*AP_FGPCM); 
     else AP_CMTR=0; break;
    }
    case 4: 
    {
     if ((AP_xI<-Math.abs(AP_yI)) && (AP_xI<-Math.abs(AP_zI)))
     AP_IndCR=AP_CMCI4+Math.floor(-AP_zI/AP_xI*AP_FGPCM)*AP_CMARS
      +3*Math.floor(-AP_yI/AP_xI*AP_FGPCM);
     else AP_CMTR=0; break;
    }
    case 5:
    {
     if ((AP_zI>Math.abs(AP_xI)) && (AP_zI>Math.abs(AP_yI)))
     AP_IndCR=AP_CMCI5+Math.floor(-AP_yI/AP_zI*AP_FGPCM)*AP_CMARS
      +3*Math.floor(AP_xI/AP_zI*AP_FGPCM);
     else AP_CMTR=0; break;
    }
    case 6: 
    {
     if ((AP_zI<-Math.abs(AP_xI)) && (AP_zI<-Math.abs(AP_yI)))
     AP_IndCR=AP_CMCI6+Math.floor(-AP_yI/AP_zI*AP_FGPCM)*AP_CMARS
      +3*Math.floor(-AP_xI/AP_zI*AP_FGPCM);
     else AP_CMTR=0; break;
    }
    default: break;
   }
   //when the cube map type condition not satisfied (deviated from the
   // previous loop cube map type), then determine the actual cube map type,
   // and Index value in the cube map array
   if (AP_CMTR==0)
   {
    AP_xIa=Math.abs(AP_xI); AP_yIa=Math.abs(AP_yI); AP_zIa=Math.abs(AP_zI);
    //check if yI is the dominant direction, and then deciding front(1) or
    // back(2) cube map type based on y sign value
    if ( (AP_yIa>AP_xIa) && (AP_yIa>AP_zIa) )
    {
     if (AP_yI>0) 
     { 
      AP_IndCR=Math.floor(AP_zI/AP_yI*AP_FGPCM)*AP_CMARS
       +3*Math.floor(AP_xI/AP_yI*AP_FGPCM)+AP_CMCI; AP_CMTR=1; }
     else 
     {
      AP_IndCR=AP_CMCI2+Math.floor(-AP_zI/AP_yI*AP_FGPCM)*AP_CMARS
       +3*Math.floor(AP_xI/AP_yI*AP_FGPCM); AP_CMTR=2;
     }
    }
    else
    {
     //similarly, check if xI is the dominant direction, and then deciding 
     // right(3) or left(4) cube map type based on x sign value
     if ( (AP_xIa>AP_yIa) && (AP_xIa>AP_zIa) ) 
     {
      if (AP_xI>0)
      {
       AP_IndCR=AP_CMCI3+Math.floor(AP_zI/AP_xI*AP_FGPCM)*AP_CMARS
        +3*Math.floor(-AP_yI/AP_xI*AP_FGPCM); AP_CMTR=3; 
      }
      else 
      {
       AP_IndCR=AP_CMCI4+Math.floor(-AP_zI/AP_xI*AP_FGPCM)*AP_CMARS
        +3*Math.floor(-AP_yI/AP_xI*AP_FGPCM); AP_CMTR=4;
      }
     }
     else
     {
      //or else, deciding top(5)or bottom(6) cube map type based on z sign value
      if (AP_zI>0) 
      {
       AP_IndCR=AP_CMCI5+Math.floor(-AP_yI/AP_zI*AP_FGPCM)*AP_CMARS
        +3*Math.floor(AP_xI/AP_zI*AP_FGPCM); AP_CMTR=5; 
      }
      else
      {
       AP_IndCR=AP_CMCI6+Math.floor(-AP_yI/AP_zI*AP_FGPCM)*AP_CMARS
        +3*Math.floor(-AP_xI/AP_zI*AP_FGPCM); AP_CMTR=6; 
      }
     }
    }
   }
   //Assigning the color values of the determined cube map array element 
   // to the pixel element of the canvas
   AP_PixO[AP_IndO]=AP_PixIC[AP_IndCR]; 
   AP_PixO[AP_IndO+1]=AP_PixIC[AP_IndCR+1]; 
   AP_PixO[AP_IndO+2]=AP_PixIC[AP_IndCR+2];
   AP_JO++;
   //generally incrementing the cell to the next adjacent column value, and 
   // when the full width end is reached, to re-initialize to next row run
   if (AP_JO==AP_SOW)
   {
    //The (xI,yI,zI) value is reverse incremented horizontally to the first
    // row point, along with the decrement factor due to increasing 
    // row index (reverse direction) 
    AP_xI-=AP_xIhs*AP_SOW+AP_xIvs; 
    AP_yI-=AP_yIhs*AP_SOW+AP_yIvs;
    AP_zI-=AP_zIhs*AP_SOW+AP_zIvs;
    AP_JO=0;
   }
   //The (xI,yI,zI) values incremented by the predetermined constant factor
   // for each adjacnet next column element within the row
   AP_xI+=AP_xIhs; AP_yI+=AP_yIhs; AP_zI+=AP_zIhs;
  }
  //Output the calculated array or the canvas image data element to the 
  // canvas for display
  AP_Ctx.putImageData(AP_ImgOd,0,0,0,0,AP_SOW,AP_SOH);
  AP_Ctx.textAlign='start';
  //Choosing font size in proportion to minimum ot canvas width/height
  if (AP_SOW<AP_SOH) AP_fs=Math.floor(13*AP_SOW/300);
  else AP_fs=Math.floor(13*AP_SOH/300);
  AP_Ctx.font=Math.round(AP_fs).toString()+'px Arial';
    
  //If Animation off, to display canvas angular range, White (full-screen) box
  // at top right and Device Orient button if needed
  if (AP_AnimPlay==0)
  {
   //Filling a white square box, and the canvas field of view in deg. units
   AP_Ctx.fillStyle = "#FFFFFF";
   AP_TextOut='↔'+Math.round(AP_FOVH).toString()+'°x'
    +Math.round(AP_FOVV).toString()+'°↕';
   AP_Ctx.fillRect(10, AP_SOH-15-0.8*AP_fs, 
   AP_Ctx.measureText(AP_TextOut).width, AP_fs); 
   AP_Ctx.fillStyle = "#000000";
   AP_Ctx.fillText(AP_TextOut, 10, AP_SOH-15);

   AP_Ctx.setLineDash([]); 
   AP_Ctx.lineWidth=4; 
   AP_Ctx.strokeStyle = "white"; 

   //If the mouse/touch is not down and double-touch not active
   //then display the fullscreen, DevOrient button options
   if ( (AP_MD==0) && (AP_DTS==0) )
   {
    //If the full screen is off, to show the rectangle box
    if (AP_FullScreenOn==false)
    {
    /* AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-35, AP_SOH-40); 
     AP_Ctx.lineTo(AP_SOW-45, AP_SOH-40); AP_Ctx.lineTo(AP_SOW-45, AP_SOH-30); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-25, AP_SOH-40); 
     AP_Ctx.lineTo(AP_SOW-15, AP_SOH-40); AP_Ctx.lineTo(AP_SOW-15, AP_SOH-30); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-35, AP_SOH-10);
     AP_Ctx.lineTo(AP_SOW-45, AP_SOH-10); AP_Ctx.lineTo(AP_SOW-45, AP_SOH-20); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-25, AP_SOH-10); 
     AP_Ctx.lineTo(AP_SOW-15, AP_SOH-10); AP_Ctx.lineTo(AP_SOW-15, AP_SOH-20);
     AP_Ctx.stroke();*/

     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-35, 40); 
     AP_Ctx.lineTo(AP_SOW-45, 40); AP_Ctx.lineTo(AP_SOW-45, 30); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-25, 40); 
     AP_Ctx.lineTo(AP_SOW-15, 40); AP_Ctx.lineTo(AP_SOW-15, 30); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-35, 10);
     AP_Ctx.lineTo(AP_SOW-45, 10); AP_Ctx.lineTo(AP_SOW-45, 20); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-25, 10); 
     AP_Ctx.lineTo(AP_SOW-15, 10); AP_Ctx.lineTo(AP_SOW-15, 20);
     AP_Ctx.stroke();
    }
    //If already in full screen, to show the regular sub-size option
    else
    {
     /*AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-39, AP_SOH-44);
     AP_Ctx.lineTo(AP_SOW-39, AP_SOH-34); AP_Ctx.lineTo(AP_SOW-49, AP_SOH-34);
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-21, AP_SOH-44); 
     AP_Ctx.lineTo(AP_SOW-21, AP_SOH-34); AP_Ctx.lineTo(AP_SOW-11, AP_SOH-34); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-39, AP_SOH-6);
     AP_Ctx.lineTo(AP_SOW-39, AP_SOH-16); AP_Ctx.lineTo(AP_SOW-49, AP_SOH-16); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-21, AP_SOH-6); 
     AP_Ctx.lineTo(AP_SOW-21, AP_SOH-16); AP_Ctx.lineTo(AP_SOW-11, AP_SOH-16); 
     AP_Ctx.stroke();*/

     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-39, 44);
     AP_Ctx.lineTo(AP_SOW-39, 34); AP_Ctx.lineTo(AP_SOW-49, 34);
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-21, 44); 
     AP_Ctx.lineTo(AP_SOW-21, 34); AP_Ctx.lineTo(AP_SOW-11, 34); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-39, 6);
     AP_Ctx.lineTo(AP_SOW-39, 16); AP_Ctx.lineTo(AP_SOW-49, 16); 
     AP_Ctx.stroke();
     AP_Ctx.beginPath(); AP_Ctx.moveTo(AP_SOW-21, 6); 
     AP_Ctx.lineTo(AP_SOW-21, 16); AP_Ctx.lineTo(AP_SOW-11, 16); 
     AP_Ctx.stroke();
    }

    if (AP_DevOrient)
    {
     AP_Ctx.lineWidth=3;
     AP_Ctx.strokeStyle = "black"; 
     //AP_Ctx.translate(AP_SOW-90,AP_SOH-38);
     AP_Ctx.translate(AP_SOW-90,14);
     AP_Ctx.rotate(-20*Math.PI/180);

     AP_Ctx.beginPath(); 
     AP_Ctx.moveTo(-1,-1); AP_Ctx.lineTo(-1,37);
     AP_Ctx.moveTo(0,37); AP_Ctx.lineTo(19,37);
     AP_Ctx.moveTo(0,35); AP_Ctx.lineTo(19,35);
     AP_Ctx.moveTo(0,33); AP_Ctx.lineTo(19,33);
     AP_Ctx.moveTo(20,37); AP_Ctx.lineTo(20,-1);
     AP_Ctx.moveTo(19,-1); AP_Ctx.lineTo(0,-1);
     AP_Ctx.stroke();
            
     AP_Ctx.fillStyle='white';
     AP_Ctx.fillRect(0,1,18,30);
     AP_Ctx.fillRect(6,34,8,2); 

     if (AP_DevOrientActive)
     {
      AP_Ctx.strokeStyle = "black";
      AP_Ctx.beginPath(); 
      AP_Ctx.moveTo(4,10); AP_Ctx.lineTo(14,20);
      AP_Ctx.moveTo(14,10); AP_Ctx.lineTo(4,20);
      AP_Ctx.stroke();
     }
     AP_Ctx.rotate(20*Math.PI/180);
     //AP_Ctx.translate(-AP_SOW+90,-AP_SOH+38);
     AP_Ctx.translate(-AP_SOW+90,-14);
  
     //To display and troubleshoot device orientation angles if needed
     /*AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut='Y'+Math.round(AP_gammarad*360/Math.PI).toString();
     AP_TextOut+=' P'+Math.round(AP_betarad*360/Math.PI).toString();
     AP_TextOut+=' R'+Math.round(AP_alpharad*360/Math.PI).toString();
     AP_Ctx.fillRect(10, AP_SOH-45-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs); 
     AP_Ctx.fillStyle = "#000000";
     AP_Ctx.fillText(AP_TextOut, 10, AP_SOH-45);*/
    }
   }
   
  }
  
  //When Legend display status is active/true, to show demo explanation text
  if ( (AP_LegDisp) && (!AP_DevOrientActive) )
  {
   AP_Ctx.textAlign='center';
   //To display appropiate text when animation play is on
   if (AP_AnimPlay==1) 
   {
	  AP_Ctx.fillStyle = "#FFFFFF";
    AP_TextOut=' Accurate Panning for Intuitive User Interactivity ';
	  AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width, 
     0.25*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
    AP_Ctx.fillStyle = "#000000"; 
    AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.25*AP_SOH);
	
	  AP_Ctx.fillStyle = "#FFFFFF";
    AP_TextOut=' Click/Tap to Stop auto-rotation ';
	  AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
     0.5*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
    AP_Ctx.fillStyle = "#000000"; 
    AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.5*AP_SOH);
	
	  AP_Ctx.fillStyle = "#FFFFFF";
    AP_TextOut=' Enquiry: accupan@spherulersolutions.com ';
	  AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
     0.8*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
    AP_Ctx.fillStyle = "#000000"; 
    AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.8*AP_SOH);
	
	  AP_Ctx.fillStyle = "#FFFFFF";
    AP_TextOut='©Spheruler Solutions';
	  AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
     0.95*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
    AP_Ctx.fillStyle = "#000000"; 
    AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.95*AP_SOH);
   }
   //If the animation play is off, then to prompt UI options by text display
   else
   {
    //When zoom, mouse down, touch points controls and PanRebounds inactive
    if ( (AP_Zoom==0) && (AP_MD==0) && (AP_DTS==0) && (AP_PanStat<4) && (AP_TP!=2) )
    {  
     AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Drop an Equirectangular Pano Image to View ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.25*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.25*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Double-click - Initial view ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.4*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.4*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Click/Tap to Auto-rotate ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.5*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.5*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_Ctx.textAlign='start';
     AP_TextOut=' ← Left';
	   AP_Ctx.fillRect(0.03*AP_SOW, 0.5*AP_SOH-0.8*AP_fs,
      AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.03*AP_SOW, 0.5*AP_SOH);
	 	 
	   AP_Ctx.textAlign='end';
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut='Right → ';
	   AP_Ctx.fillRect(0.97*AP_SOW-AP_Ctx.measureText(AP_TextOut).width,
      0.5*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.97*AP_SOW, 0.5*AP_SOH);
	 
	   AP_Ctx.textAlign='center';
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut='↑';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.06*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.06*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Up ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.10*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.1*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Down ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.95*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.95*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut='↓';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.99*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.99*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Mouse-down/Touch on a scene point ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.6*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.6*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Mouse-scroll to zoom about the point ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.7*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.7*AP_SOH);
	 
	   AP_Ctx.fillStyle = "#FFFFFF";
     AP_TextOut=' Pan with dual Touchscreen points ';
	   AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
      0.8*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
     AP_Ctx.fillStyle = "#000000"; 
     AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.8*AP_SOH);
    } 
    //Otherwise to identify and display UI actions based on mouse/pan status
    else
    {
     AP_Ctx.lineWidth=4;
	   AP_Ctx.strokeStyle = "red";
     //When the Mouse down (or single touch) has just initiated
     if (AP_MD==1) 
	   {
	    AP_Ctx.fillStyle = "#FFFFFF";
      AP_TextOut=' Move/Drag the selected point to Pan ';
	    AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
       0.5*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
      AP_Ctx.fillStyle = "#000000"; 
      AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.5*AP_SOH);
	   }
     //Upon movement with Mouse down (or single touch and dragging), to pan
     if (AP_MD==2) 
     {
      //If the single point panning status is active with valid movements
      if (AP_PanStat==1) 
	    {
	     AP_Ctx.fillStyle = "#FFFFFF";
       AP_TextOut=' Exact Panning with the selected point ';
	     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
        0.5*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
       AP_Ctx.fillStyle = "#000000"; 
       AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.5*AP_SOH);
	    }
      //When point panning exceeded (nadir/zenith crossing its hemispher zone)
      if (AP_PanStat==2) 
      {
       //To show the dashed line of horizon
       AP_Ctx.beginPath();
	     AP_Ctx.setLineDash([10,5]); 
	     AP_Ctx.moveTo(0, 0.5*AP_SOH); 
	     AP_Ctx.lineTo(AP_SOW, 0.5*AP_SOH); 
	     AP_Ctx.stroke();
	   
       if (AP_Ryz>0)
	     {
		    AP_Ctx.fillStyle = "#FFFFFF";
        AP_TextOut=' Zenith point crossed to lower zone! ';
		    AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
         0.6*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
        AP_Ctx.fillStyle = "#FF0000"; 
        AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.6*AP_SOH);
	     }
       else 
	     {
		    AP_Ctx.fillStyle = "#FFFFFF";
        AP_TextOut=' Nadir point crossed to upper zone! ';
  	    AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
         0.45*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
        AP_Ctx.fillStyle = "#FF0000"; 
        AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.45*AP_SOH);
	     }
      }
      //When point panning exceeded (nadir/zenith away from central vertical)
      if (AP_PanStat==3)
      {
        //To show the central trace axis of vetical y-z plane
       AP_Ctx.beginPath();
	     AP_Ctx.setLineDash([10,5]); 
	     AP_Ctx.moveTo(0.5*AP_SOW,0);
	     AP_Ctx.lineTo(0.5*AP_SOW, AP_SOH);
	     AP_Ctx.stroke();
       if (AP_Ryz>0)
	     {
		    AP_Ctx.fillStyle = "#FFFFFF";
        AP_TextOut=' Zenith/Nadir off from vertical view plane! ';
		    AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
         0.6*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
        AP_Ctx.fillStyle = "#FF0000"; 
        AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.6*AP_SOH);
	     }
       else 
	     {
		    AP_Ctx.fillStyle = "#FFFFFF";
        AP_TextOut=' Nadir/Zenith off from vertical view plane! ';
		    AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
         0.45*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
        AP_Ctx.fillStyle = "#FF0000"; 
        AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.45*AP_SOH);
	     }
      }
     }
     //When the panning status is in rebound mode to show associated text
     if ((AP_PanStat==4) || (AP_PanStat==6))
     {
      //when zenith vector is not tagged away from vertical (y-z) plane
      if (Math.abs(AP_Rxz)<0.001)
      {
       //if zenith vector resolved coordinate is pointing down in output canvas
       if (AP_Rzz<0)
       {
        AP_Ctx.beginPath(); 
		    AP_Ctx.setLineDash([10,5]);
		    AP_Ctx.moveTo(0, 0.5*AP_SOH);
		    AP_Ctx.lineTo(AP_SOW, 0.5*AP_SOH);
		    AP_Ctx.stroke();
        //Checking whether zenith or nadir is in the purview zone
        if (AP_Ryz>0)
		    {
		     AP_Ctx.fillStyle = "#FFFFFF";
         AP_TextOut=' Restoring Zenith to the upper horizon limit ';
		     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
          0.6*AP_SOH-0.8*AP_fs, AP_Ctx.measureText(AP_TextOut).width, AP_fs);
         AP_Ctx.fillStyle = "#0000FF"; 
         AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.6*AP_SOH);
		    }
        else
		    {
		     AP_Ctx.fillStyle = "#FFFFFF";
         AP_TextOut=' Restoring Nadir to the lower horizon limit ';
		     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
          0.45*AP_SOH-0.8*AP_fs,AP_Ctx.measureText(AP_TextOut).width, AP_fs);
         AP_Ctx.fillStyle = "#0000FF"; 
         AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.45*AP_SOH);
		    }
       }
      }
      //zenith vector is tagged away from central y-z plane of canvas
      else
      {
       AP_Ctx.beginPath(); 
	     AP_Ctx.setLineDash([10,5]); 
	     AP_Ctx.moveTo(0.5*AP_SOW,0); 
	     AP_Ctx.lineTo(0.5*AP_SOW, AP_SOH); 
	     AP_Ctx.stroke();
       //if zenith vector z-coordinate is also pointing down in output canvas
       if (AP_Rzz<0)
       {
        AP_Ctx.beginPath(); 
		    AP_Ctx.setLineDash([10,5]);
		    AP_Ctx.moveTo(0, 0.5*AP_SOH); 
		    AP_Ctx.lineTo(AP_SOW, 0.5*AP_SOH); 
		    AP_Ctx.stroke();
        //Checking whether zenith or nadir is in the purview zone
        if (AP_Ryz>0) 
		    {
		     AP_Ctx.fillStyle = "#FFFFFF";
         AP_TextOut=' Restoring Zenith uprightness and to upper horizon ';
		     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
          0.6*AP_SOH-0.8*AP_fs,AP_Ctx.measureText(AP_TextOut).width, AP_fs);
         AP_Ctx.fillStyle = "#0000FF"; 
         AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.6*AP_SOH);
	    	}
        else
		    {
		     AP_Ctx.fillStyle = "#FFFFFF";
         AP_TextOut=' Restoring Nadir uprightness and to lower horizon ';
		     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
          0.45*AP_SOH-0.8*AP_fs,AP_Ctx.measureText(AP_TextOut).width, AP_fs);
         AP_Ctx.fillStyle = "#0000FF"; 
         AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.45*AP_SOH);
		    }
       }
       //when zenith vector has not tagged away from central y-z canvas plane
       else
       {
        //Checking whether zenith or nadir is in the purview zone
        if (AP_Ryz>0)
		    {
		     AP_Ctx.fillStyle = "#FFFFFF";
         AP_TextOut=' Restoring Zenith uprightness ';
		     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
          0.6*AP_SOH-0.8*AP_fs,AP_Ctx.measureText(AP_TextOut).width, AP_fs);
         AP_Ctx.fillStyle = "#0000FF"; 
         AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.6*AP_SOH);
		    }
		    else
		    {
		     AP_Ctx.fillStyle = "#FFFFFF";
         AP_TextOut=' Restoring Nadir uprightness ';
		     AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
          0.45*AP_SOH-0.8*AP_fs,AP_Ctx.measureText(AP_TextOut).width, AP_fs);
         AP_Ctx.fillStyle = "#0000FF"; 
         AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.45*AP_SOH);
		    }
       } 
      }
     }
	   AP_TextOut='';
     //In case of mouse scroll initiated zoom events
     if (AP_MD==0)
     {
      if (AP_Zoom==1)  AP_TextOut=' Zoomed-out ';
      if (AP_Zoom==2)  AP_TextOut=' Zoomed-in ';
      if (AP_Zoom==3)  AP_TextOut=' Field-of-view max. limit ';
      if (AP_Zoom==4)  AP_TextOut=' Field-of-view min. limit ';
      if (AP_Zoom==5)  AP_TextOut=' Zenith near horizon limit ';
      if (AP_Zoom==6)  AP_TextOut=' Nadir near horizon limit ';
      if ( (AP_Zoom==5) || (AP_Zoom==6) )
      {
       AP_Ctx.beginPath();
	     AP_Ctx.setLineDash([10,5]);
	     AP_Ctx.moveTo(0, 0.5*AP_SOH);
	     AP_Ctx.lineTo(AP_SOW, 0.5*AP_SOH);
	     AP_Ctx.stroke();
      }
      if (AP_Zoom==7)  AP_TextOut=' Zenith upright constraint ';
      if (AP_Zoom==8)  AP_TextOut=' Nadir upright constraint ';
      if ( (AP_Zoom==7) || (AP_Zoom==8) )
      {
       AP_Ctx.beginPath(); 
	     AP_Ctx.setLineDash([10,5]); 
	     AP_Ctx.moveTo(0.5*AP_SOW,0);
	     AP_Ctx.lineTo(0.5*AP_SOW, AP_SOH);
	     AP_Ctx.stroke();
      }
     }
     if (AP_DTS==1) AP_TextOut=' Dual point control to Rotate/Zoom the view ';
   //  if ((AP_DTS==2) && (AP_PanStat==5)) AP_TextOut=' Scene Rotated/Zoomed exactly with the Dual points ';
     if (AP_PanStat==5) AP_TextOut=' Scene Rotated/Zoomed exactly with the Dual points ';
     if (AP_PanStat==7) AP_TextOut=' ! ';
	   if (AP_TextOut!='')
	   {
	    AP_Ctx.fillStyle = "#FFFFFF";
	    AP_Ctx.fillRect(0.5*AP_SOW-0.5*AP_Ctx.measureText(AP_TextOut).width,
       0.45*AP_SOH-0.8*AP_fs,AP_Ctx.measureText(AP_TextOut).width, AP_fs);
	    AP_Ctx.fillStyle = "#000000";
      if ((AP_Zoom>=3) && (AP_Zoom<=8)) AP_Ctx.fillStyle = "#FF0000";
	    AP_Ctx.fillText(AP_TextOut, 0.5*AP_SOW, 0.45*AP_SOH);
	   }
    }
   }
   //Depict the gnomonic projection coordinates of zenith/nadir as red circle
   AP_ZNsx=Math.floor((AP_Rxz/AP_Ryz)/AP_SF+0.5*AP_SOW);
   AP_ZNsy=Math.floor((-AP_Rzz/AP_Ryz)/AP_SF+0.5*AP_SOH);
   AP_Ctx.beginPath();
   AP_Ctx.arc(AP_ZNsx, AP_ZNsy, 5, 0, 2 * Math.PI);
   AP_Ctx.fillStyle = "red";
   AP_Ctx.fill(); 
  }

  //(TODO) Showing the two touched points on canvas, for debugging
  //the (sometimes) skipped rotation effect
  if ( (AP_TP==2) && (AP_DTS==2) )
  {
   AP_Ctx.beginPath();
   AP_Ctx.arc(AP_a1+0.5*AP_SOW, 0.5*AP_SOH-AP_b1, 5, 0, 2 * Math.PI);
   AP_Ctx.fillStyle = "red";
   AP_Ctx.fill();
     
   AP_Ctx.beginPath();
   AP_Ctx.arc(AP_a2+0.5*AP_SOW, 0.5*AP_SOH-AP_b2, 5, 0, 2 * Math.PI);
   AP_Ctx.fillStyle = "red";
   AP_Ctx.fill();
  }
  if (document.getElementById('RX')) document.getElementById('RX').value=AP_Rxx;
  if (document.getElementById('RY')) document.getElementById('RY').value=AP_Rxy;
  if (document.getElementById('RZ')) document.getElementById('RZ').value=AP_Rxz;
  if (document.getElementById('LX')) document.getElementById('LX').value=AP_Rxx;
  if (document.getElementById('LY')) document.getElementById('LY').value=AP_Rxy;
  if (document.getElementById('LZ')) document.getElementById('LZ').value=AP_Rxz;
 }

 //function call for executing the animated run of the canvas with the view orientation parameters updated each time
 function AP_PauseResume()
 {
  //noting the current (new) quaternion parameters to be the present value
  AP_qp0=AP_qn0; AP_qp1=AP_qn1; AP_qp2=AP_qn2; AP_qp3=AP_qn3;
  //finding the new quaternion parameters due to additional rotation operation qa (wrt to current axis, so post multiplication) on the quaternion qp
  AP_qn0=AP_qp0*AP_qa0-AP_qp1*AP_qa1-AP_qp2*AP_qa2-AP_qp3*AP_qa3;
  AP_qn1=AP_qp0*AP_qa1+AP_qp1*AP_qa0+AP_qp2*AP_qa3-AP_qp3*AP_qa2;
  AP_qn2=AP_qp0*AP_qa2+AP_qp2*AP_qa0+AP_qp3*AP_qa1-AP_qp1*AP_qa3; 
  AP_qn3=AP_qp0*AP_qa3+AP_qp3*AP_qa0+AP_qp1*AP_qa2-AP_qp2*AP_qa1;
  //finding the updated z-resolved (upward in the view) component of Zenith/Top position due to the imposed additional orientation change
  AP_Tz=AP_qn0*AP_qn0-AP_qn1*AP_qn1-AP_qn2*AP_qn2+AP_qn3*AP_qn3;
  //if the calculated z coordinate is in the upper hemisphere, then it is permissible setting for render
  //Note: In case of leftward/rightward auto rotation, rotation happens about the zenith point, so all components of zenith includeing AP_Tz would remain unchanged
  if (AP_Tz>0.0) AP_Render();
  //In upward/downward auto-rotations about the horizontal axis, so AP_Tz traces along central line and can become negative at forward/backward horizons respectively 
  else 
  {
   //To prevent the zenith exceeding the horizon limit, the rotation operation is corrected to happen instead about the locked zenith axis
   AP_qn0=AP_qp0; AP_qn1=AP_qp1; AP_qn2=AP_qp2; AP_qn3=AP_qp3;
   //computing the previous instance of Zenith axis components 
   AP_Tx=2*(AP_qn1*AP_qn3-AP_qn0*AP_qn2);
   AP_Ty=2*(AP_qn2*AP_qn3+AP_qn0*AP_qn1);
   AP_Tz=AP_qn0*AP_qn0-AP_qn1*AP_qn1-AP_qn2*AP_qn2+AP_qn3*AP_qn3;
   document.getElementById('Output').style.cursor='e-resize';   
   //If the clicked point is (middle) right-hand side & view is towards the zenith region, then rotation is about zenith to maintaing continuity in rotation convention
   if (AP_Mdx*AP_Ty<0) { AP_Rotx=AP_Tx; AP_Roty=AP_Ty; AP_Rotz=AP_Tz; }
   //else, the rotation axis is reversed. The combination logic also works in case of vew towards the nadir location
   else { AP_Rotx=-AP_Tx; AP_Roty=-AP_Ty; AP_Rotz=-AP_Tz; }
   //Identifying the qa of additional rotation, associating the reverse notation of starting reference axis wrt to concurrent axis 
   AP_qa0=Math.cos(-AP_RotWs/2);  AP_qa1=Math.sin(-AP_RotWs/2)*AP_Rotx; AP_qa2=Math.sin(-AP_RotWs/2)*AP_Roty; AP_qa3=Math.sin(-AP_RotWs/2)*AP_Rotz;
  }
  //When the animation play option is running active mode
  if (AP_AnimPlay==1) window.requestAnimationFrame(AP_PauseResume);
 }
 
 //function called upon mouse-down or 1-touch start condition
 function AP_Start()
 {
  //Gnomonic projection distance coordinates of start mouse/touch point
  var AP_P1hO, AP_P1vO;
  //Noting the mouse/1-touch point coordinates
  AP_Mdx=AP_Evx-AP_Rect.left;  AP_Mdy=AP_Evy-AP_Rect.top;
  //Noting the Zenith/Top vector coordinates wrt screen xyz axis
  AP_Tx=AP_Rxz; AP_Ty=AP_Ryz; AP_Tz=AP_Rzz;
  //When the animation is playing, upon mouse-down/touch, this status change
  // to a dummy value 2 puts break to the PauseResume() which is running in
  // parallel.
  if (AP_AnimPlay==1) AP_AnimPlay=2;
  //Calculating the gnomonic projection distance coordinates of screen point
  AP_P1hO=(AP_Mdx+0.5-0.5*AP_SOW)*AP_SF; AP_P1vO=(0.5*AP_SOH-0.5-AP_Mdy)*AP_SF; 
  //and deducing the equivalent normalized vector coordinates x,y,z
  AP_P1y=1/Math.sqrt(1+AP_P1hO*AP_P1hO+AP_P1vO*AP_P1vO);
  AP_P1x=AP_P1y*AP_P1hO; AP_P1z=AP_P1y*AP_P1vO;
  AP_Render();
 }
 
 function AP_Move()
 {
  //Term1 is squared cosine of angle between Initial mouse/touch point P1 and the Zenith/Top point T
  var AP_TermM1=AP_Tx*AP_P1x+AP_Ty*AP_P1y+AP_Tz*AP_P1z;
  //Term2 is the Discriminant of the quadratic function, and needs to be greater than zero for valid panning within the constraint limit
  var AP_TermM2=1-AP_TermM1*AP_TermM1-AP_P2x*AP_P2x;
  //square-root of the above Discriminant (of quadratic equation) for valid real solution conditions
  var AP_TermM3;
  //squared cosine value of the minimum angular distance of point P2 from the central meridian
  //It is the sum of squares of y and z coordiantes, or also (1 - square of x coordiante of P2)
  var AP_TermM4=1-(AP_P2x*AP_P2x);
  //Top/Zenith point final position under ideal/regular panning condition
  var AP_TIx, AP_TIy, AP_TIz;
  //Top/Zenith point transient point due to the view constraint
  var AP_TIIx, AP_TIIy, AP_TIIz;

  var AP_PChgx, AP_PChgy, AP_PChgz;
  var AP_TermM5, AP_TermM6;
  
  var AP_TChgx, AP_TChgy, AP_TChgz;
  var AP_Net_RotIx, AP_Net_RotIy, AP_Net_RotIz, AP_VMag, AP_Net_RotIW;
 
  AP_PChgx=AP_P2x-AP_P1x; AP_PChgy=AP_P2y-AP_P1y; AP_PChgz=AP_P2z-AP_P1z; 
  AP_TermM5=AP_P2x*AP_P1x+AP_P2y*AP_P1y+AP_P2z*AP_P1z;
  
  //When the P2 point is not getting moved beyond the limits from the central meridian line of the zenith trace
  if (AP_TermM2>0)
  {   
   AP_TermM3=Math.sqrt(AP_TermM2);
   //Formula for z coordinate for the first possible zenith point T1 (that is at the far-top end compared to T2 solution)
   AP_TIx=0; 
   //If the point P1 is below the T point
   if (AP_Tz*AP_P1y>AP_Ty*AP_P1z)
   {
    AP_TIz=(AP_P2z*AP_TermM1+AP_P2y*AP_TermM3)/AP_TermM4; 
    //finding the y coordinate of T1
    AP_TIy=(AP_P2y*AP_TermM1-AP_P2z*AP_TermM3)/AP_TermM4; 
   }
   //when the point P1 is below the T point
   else
   {
    AP_TIz=(AP_P2z*AP_TermM1-AP_P2y*AP_TermM3)/AP_TermM4; 
    //finding the y coordinate of T1
    AP_TIy=(AP_P2y*AP_TermM1+AP_P2z*AP_TermM3)/AP_TermM4;
   }
   //If the T1 point itself is in the upper hemisphere
   if (AP_TIz>0) AP_PanStat=1;
   else 
   {
    AP_PanStat=2;
    AP_TIIx=0; AP_TIIz=0;
    if (AP_TIy>0) AP_TIIy=1; else AP_TIIy=-1;
   }
  }
  else
  {
   //Finding the (y,z) components of difference vector T
   if (AP_P2x*AP_TermM1>0)
   { 
    AP_TIx=AP_TermM1*AP_P2x-Math.sqrt(1-AP_TermM1*AP_TermM1)*Math.sqrt(AP_TermM4);
    AP_TIy=AP_TermM1*AP_P2y+Math.sqrt(1-AP_TermM1*AP_TermM1)*AP_P2x*AP_P2y/Math.sqrt(AP_TermM4);
    AP_TIz=AP_TermM1*AP_P2z+Math.sqrt(1-AP_TermM1*AP_TermM1)*AP_P2x*AP_P2z/Math.sqrt(AP_TermM4);
   }
   else
   { 
    AP_TIx=AP_TermM1*AP_P2x+Math.sqrt(1-AP_TermM1*AP_TermM1)*Math.sqrt(AP_TermM4);
    AP_TIy=AP_TermM1*AP_P2y-Math.sqrt(1-AP_TermM1*AP_TermM1)*AP_P2x*AP_P2y/Math.sqrt(AP_TermM4);
    AP_TIz=AP_TermM1*AP_P2z-Math.sqrt(1-AP_TermM1*AP_TermM1)*AP_P2x*AP_P2z/Math.sqrt(AP_TermM4);
   }   
     
   AP_PanStat=3;
   AP_VMag=Math.sqrt(AP_TIy*AP_TIy+AP_TIz*AP_TIz);
   AP_TIIx=0;
   AP_TIIy=AP_TIy/AP_VMag; AP_TIIz=AP_TIz/AP_VMag;
   if (AP_TIIz<0) { AP_TIIz=0; if (AP_TIy>0) AP_TIIy=1; else AP_TIIy=-1; }
  }
     
  AP_TChgx=AP_TIx-AP_Tx; AP_TChgy=AP_TIy-AP_Ty; AP_TChgz=AP_TIz-AP_Tz;
  //Finding the rotation axis as the cross-product of difference vectors of P and T 
  AP_Net_RotIx=AP_PChgy*AP_TChgz-AP_PChgz*AP_TChgy;
  AP_Net_RotIy=AP_PChgz*AP_TChgx-AP_PChgx*AP_TChgz;
  AP_Net_RotIz=AP_PChgx*AP_TChgy-AP_PChgy*AP_TChgx;
 
  //Finding the magnitude of Rotation vector and normalizing
  AP_VMag=Math.sqrt(AP_Net_RotIx*AP_Net_RotIx+AP_Net_RotIy*AP_Net_RotIy+AP_Net_RotIz*AP_Net_RotIz);
  AP_Net_RotIx= AP_Net_RotIx/AP_VMag;
  AP_Net_RotIy= AP_Net_RotIy/AP_VMag; 
  AP_Net_RotIz= AP_Net_RotIz/AP_VMag;
  //Finding the cosine factor value of angle between P1 and Rotation vector, to calculate the rotation angle from the spherical triangle R-P1-P2
  AP_TermM6=AP_Net_RotIx*AP_P1x+AP_Net_RotIy*AP_P1y+AP_Net_RotIz*AP_P1z;
  //Condition check for within +/-1 cos(rotation angle) criteria
  if (Math.abs((AP_TermM5-AP_TermM6*AP_TermM6)/(1-AP_TermM6*AP_TermM6))<1)
  {
   AP_Net_RotIW=Math.acos((AP_TermM5-AP_TermM6*AP_TermM6)/(1-AP_TermM6*AP_TermM6)); 
   
   //picking the right sense of rotation axis with clockwise rotation about it
   if (AP_Net_RotIx*(AP_P1y*AP_P2z-AP_P1z*AP_P2y)+AP_Net_RotIy*(AP_P1z*AP_P2x-AP_P1x*AP_P2z)
    +AP_Net_RotIz*(AP_P1x*AP_P2y-AP_P1y*AP_P2x)<0) 
   { AP_Net_RotIW=-AP_Net_RotIW; } 
    
   if ( (AP_Zoom==0) || (AP_PanStat==1) )
   {
    AP_qa0=Math.cos(-AP_Net_RotIW/2); 
    AP_TermM1=Math.sin(-AP_Net_RotIW/2); 
    AP_qa1=AP_TermM1*AP_Net_RotIx;  AP_qa2=AP_TermM1*AP_Net_RotIy;  AP_qa3=AP_TermM1*AP_Net_RotIz;
     
    AP_qn0=AP_qp0*AP_qa0-AP_qp1*AP_qa1-AP_qp2*AP_qa2-AP_qp3*AP_qa3; 
    AP_qn1=AP_qp0*AP_qa1+AP_qp1*AP_qa0+AP_qp2*AP_qa3-AP_qp3*AP_qa2;
    AP_qn2=AP_qp0*AP_qa2+AP_qp2*AP_qa0+AP_qp3*AP_qa1-AP_qp1*AP_qa3; 
    AP_qn3=AP_qp0*AP_qa3+AP_qp3*AP_qa0+AP_qp1*AP_qa2-AP_qp2*AP_qa1;
    
    if (AP_Zoom==1) document.getElementById('Output').style.cursor='zoom-out';
    if (AP_Zoom==2) document.getElementById('Output').style.cursor='zoom-in';
    AP_Render();
    //AP_Mdx=AP_Evx-AP_Rect.left;  AP_Mdy=AP_Evy-AP_Rect.top;            
    AP_P1x=AP_P2x; AP_P1y=AP_P2y; AP_P1z=AP_P2z;
    AP_Tx=AP_Rxz; AP_Ty=AP_Ryz; AP_Tz=AP_Rzz; AP_Zoom=0;
   }
   else
   {
    document.getElementById('Output').style.cursor='not-allowed';
    if (AP_PanStat==2) { if (AP_TIIy>0) AP_Zoom=5; else AP_Zoom=6; AP_Mag=AP_Mag/0.9; }
    if (AP_PanStat==3) { if (AP_TIIy>0) AP_Zoom=7; else AP_Zoom=8; AP_Mag=AP_Mag/1.1; }
    AP_Render();
   }
  }
  if (AP_MD==2)
  {
   if (AP_PanStat==1) document.getElementById('Output').style.cursor='crosshair';
   else document.getElementById('Output').style.cursor='not-allowed';
   //if (AP_PanStat==3) document.getElementById('Output').style.cursor='alias';
   if (AP_PanStat!=1)
   {
    AP_RotIIx=AP_TIy*AP_TIIz-AP_TIz*AP_TIIy;
    AP_RotIIy=AP_TIz*AP_TIIx-AP_TIx*AP_TIIz;
    AP_RotIIz=AP_TIx*AP_TIIy-AP_TIy*AP_TIIx;
    AP_VMag=Math.sqrt(AP_RotIIx*AP_RotIIx+AP_RotIIy*AP_RotIIy+AP_RotIIz*AP_RotIIz);
    AP_RotIIx= AP_RotIIx/AP_VMag; AP_RotIIy= AP_RotIIy/AP_VMag; AP_RotIIz= AP_RotIIz/AP_VMag;
    AP_RotIIW=Math.acos(AP_TIx*AP_TIIx+AP_TIy*AP_TIIy+AP_TIz*AP_TIIz);
   }
  }
 }

 //function call for executing upon left mouse up/release (or) mouse point
 // leaving canvas (or) single touch point ending (or) touch leaving canvas
 function AP_End()
 {
  //Calculation (quaternion) term corresponding to the sin of step angle for rebound purpose
  var AP_Term1;
  //Top/Zenith point final position under ideal/regular panning condition
  var AP_TIx, AP_TIy, AP_TIz;
  //Top/Zenith point transient point due to the view constraint
  var AP_TIIx, AP_TIIy, AP_TIIz;
  //Magnitude of To/Zenith or Rotation vector for normalizing
  var AP_TMag;

  if ((AP_AnimPlay==0) && (AP_MD==1)) 
  {
   //Check for clicking on the FullScreen rectangle mark of canvas
   //if ( (Math.abs(AP_Mdx-(AP_SOW-30))<=16) && (Math.abs(AP_Mdy-(AP_SOH-25))<=16) )
   if ( (Math.abs(AP_Mdx-(AP_SOW-30))<=16) && (Math.abs(AP_Mdy-25)<=16) )
   {
    AP_AnimPlay=0; AP_MD=0; AP_PanStat=0;
    AP_OpenCloseFullScreen();
   }
   else
   {
    //If DeviceOrient is available and if clicked on the DevOrient icon
    //if ( (AP_DevOrient) && ( (Math.abs(AP_Mdx-(AP_SOW-81))<=16) && (Math.abs(AP_Mdy-(AP_SOH-25))<=16) ) )
    //if ( (AP_DevOrient) && ( (Math.abs(AP_Mdx-(AP_SOW-81))<=16) && (Math.abs(AP_Mdy-29)<=16) ) )
    if ( (Math.abs(AP_Mdx-(AP_SOW-81))<=16) && (Math.abs(AP_Mdy-29)<=16) )
    {
     if (AP_DevOrient)
     {
      if (AP_DevOrientActive) 
      {
       AP_DevOrientActive=false;
       AP_TIx=AP_Rxz; AP_TIy=AP_Ryz; AP_TIz=AP_Rzz;
       AP_TIIx=0; AP_TIIy=AP_TIy; AP_TIIz=AP_TIz; 

       //Magnitude of Y-Z projected T vector for finding rebound T/zenith point
       AP_TMag=Math.sqrt(AP_TIIy*AP_TIIy+AP_TIIz*AP_TIIz);
       AP_TIIy=AP_TIIy/AP_TMag; AP_TIIz=AP_TIIz/AP_TMag;
        //Checking and ensuring rebound T to lie in Y-Z plane upper hemisphere
       if (AP_TIIz<0) { AP_TIIz=0; if (AP_TIIy>0) AP_TIIy=1; else AP_TIIy=-1; }
       //Calculating the rebound (second) rotation axis and angle(W)
       // as cross-product of governing T/zenith vector (minimum rotation path)
       AP_RotIIx=AP_TIy*AP_TIIz-AP_TIz*AP_TIIy;
       AP_RotIIy=AP_TIz*AP_TIIx-AP_TIx*AP_TIIz;
       AP_RotIIz=AP_TIx*AP_TIIy-AP_TIy*AP_TIIx;
       AP_TMag=Math.sqrt(AP_RotIIx*AP_RotIIx+AP_RotIIy*AP_RotIIy
        +AP_RotIIz*AP_RotIIz);
       AP_RotIIx= AP_RotIIx/AP_TMag; AP_RotIIy= AP_RotIIy/AP_TMag; 
       AP_RotIIz= AP_RotIIz/AP_TMag;
       AP_RotIIW=Math.acos(AP_TIx*AP_TIIx+AP_TIy*AP_TIIy+AP_TIz*AP_TIIz);

       AP_Rebound_Cycles=Math.floor(AP_RotIIW*180/Math.PI)+1;
       AP_qa0=Math.cos(-AP_RotIIW/(2*AP_Rebound_Cycles)); 
       AP_Term1=Math.sin(-AP_RotIIW/(2*AP_Rebound_Cycles));
       AP_qa1=AP_Term1*AP_RotIIx;  AP_qa2=AP_Term1*AP_RotIIy;  AP_qa3=AP_Term1*AP_RotIIz;
       //TODO: The rebound live updation of canvas does not show the expected transient legend messages. To be resolved.
       AP_Cycle_no=0; AP_PanStat=4;
       AP_Rebound(); 
      }
      else 
      {
       AP_DevOrientActive=true;
       AP_DevOrientStarted=false;
       AP_DeviceOrientationRequestPermission();
      }
      AP_Render();
     }
     AP_AnimPlay=0; AP_MD=0; AP_PanStat=0;
    }
    else
    {
     if (!AP_DevOrientActive)
     {
      AP_Mdx-=0.5*AP_SOW; AP_Mdy-=0.5*AP_SOH;
      if ((AP_Mdx>AP_Mdy) && (AP_Mdx>-AP_Mdy)) 
      {
       AP_Rotx=AP_Tx; AP_Roty=AP_Ty; AP_Rotz=AP_Tz; 
       document.getElementById('Output').style.cursor='e-resize';
      }
      if ((AP_Mdx<AP_Mdy) && (AP_Mdx<-AP_Mdy)) 
      {
       AP_Rotx=-AP_Tx; AP_Roty=-AP_Ty; AP_Rotz=-AP_Tz; 
       document.getElementById('Output').style.cursor='e-resize';
      }
      if ((AP_Mdx<AP_Mdy) && (AP_Mdx>-AP_Mdy)) 
      {
       AP_Rotx=1; AP_Roty=0; AP_Rotz=0; 
       document.getElementById('Output').style.cursor='n-resize';
      }
      if ((AP_Mdx>AP_Mdy) && (AP_Mdx<-AP_Mdy)) 
      { 
       AP_Rotx=-1; AP_Roty=0; AP_Rotz=0;
       document.getElementById('Output').style.cursor='n-resize';
      }
      AP_qa0=Math.cos(-AP_RotWs/2);  
      AP_qa1=Math.sin(-AP_RotWs/2)*AP_Rotx; 
      AP_qa2=Math.sin(-AP_RotWs/2)*AP_Roty; AP_qa3=Math.sin(-AP_RotWs/2)*AP_Rotz;
      AP_AnimPlay=1; AP_MD=0; AP_PanStat=0; AP_PauseResume();
     }
    }
   }
  }
  else 
  {
   if (AP_MD==1) { AP_AnimPlay=0; AP_PanStat=0;  }
   if ((AP_MD==2) && (AP_PanStat!=1))
   {
    AP_Rebound_Cycles=Math.floor(AP_RotIIW*180/Math.PI)+1;
    AP_qa0=Math.cos(-AP_RotIIW/(2*AP_Rebound_Cycles)); 
    AP_Term1=Math.sin(-AP_RotIIW/(2*AP_Rebound_Cycles));
    AP_qa1=AP_Term1*AP_RotIIx;  AP_qa2=AP_Term1*AP_RotIIy;  AP_qa3=AP_Term1*AP_RotIIz;
    AP_PanStat=4;
    AP_Cycle_no=0;
    AP_Rebound(); 
   }
   else AP_PanStat=0;

   AP_AnimPlay=0; 
   AP_MD=0;
   AP_Render();
  }

 }

 //Routine for executing the Double Touch End occurence, called upon genuine 
 // completion of Two-touch (or) >2 touch points (or) touch point leaving
 // the canvas
 function AP_DoubleTouchEnd()
 {
  var AP_DTEnd_Term1;
  AP_Rebound_Cycles=Math.floor(AP_RotIIW*180/Math.PI)+1;
  AP_qa0=Math.cos(-AP_RotIIW/(2*AP_Rebound_Cycles));
  AP_DTEnd_Term1=Math.sin(-AP_RotIIW/(2*AP_Rebound_Cycles));
  AP_qa1=AP_DTEnd_Term1*AP_RotIIx;  AP_qa2=AP_DTEnd_Term1*AP_RotIIy;  AP_qa3=AP_DTEnd_Term1*AP_RotIIz;
  if ( (AP_Mag<=4) && (AP_Mag>=0.25) ) AP_Mag_Step=0;
  else
  {
   if (AP_Mag>4) AP_Mag_Step=(4.0-AP_Mag)/(1.0*AP_Rebound_Cycles);
   if (AP_Mag<0.25) AP_Mag_Step=-(AP_Mag-0.25)/(1.0*AP_Rebound_Cycles);
  }
  AP_PanStat=6;
  AP_Cycle_no=0;
  AP_Rebound();
  AP_DTS=0;
  AP_Render();
 }

 function AP_Rebound()
 {
  AP_qp0=AP_qn0; AP_qp1=AP_qn1; AP_qp2=AP_qn2; AP_qp3=AP_qn3;
  AP_qn0=AP_qp0*AP_qa0-AP_qp1*AP_qa1-AP_qp2*AP_qa2-AP_qp3*AP_qa3;
  AP_qn1=AP_qp0*AP_qa1+AP_qp1*AP_qa0+AP_qp2*AP_qa3-AP_qp3*AP_qa2;
  AP_qn2=AP_qp0*AP_qa2+AP_qp2*AP_qa0+AP_qp3*AP_qa1-AP_qp1*AP_qa3; 
  AP_qn3=AP_qp0*AP_qa3+AP_qp3*AP_qa0+AP_qp1*AP_qa2-AP_qp2*AP_qa1;
  if (AP_PanStat==6) AP_Mag+=AP_Mag_Step;
  AP_Render();
  AP_Cycle_no++;
  if (AP_Cycle_no<AP_Rebound_Cycles) window.requestAnimationFrame(AP_Rebound);
   else { AP_PanStat=0; AP_Mag_Step=0; AP_Render(); }
 }

 //
 function AP_StartPosition()
 {
  AP_Mag=1.0; AP_Zoom=0; AP_RotWs=Math.PI/720; AP_MD=0; AP_DTS=0; AP_TP=0;
  AP_qn0=1.0; AP_qn1=0; AP_qn2=0; AP_qn3=0;
  AP_qa0=Math.cos(-AP_RotWs/2);  AP_qa1=0.0; AP_qa2=0.0; AP_qa3=Math.sin(-AP_RotWs/2); AP_AnimPlay=0;
  AP_qa0=1; AP_qa3=0;
  AP_Render();
 }

 //function call to display the panorama rendering canvas in full screen mode
 function AP_OpenCloseFullScreen() 
 {
  if (AP_FullScreenOn==false)
  {
   AP_FullScreenOn=true;
   if (AP_Can.requestFullscreen) AP_Can.requestFullscreen();
    else if (AP_Can.mozRequestFullScreen) AP_Can.mozRequestFullScreen();
    else if (AP_Can.webkitRequestFullscreen) AP_Can.webkitRequestFullScreen();
    else if (AP_Can.msRequestFullscreen) AP_Can.msRequestFullscreen(); 
   // AP_ResizeRender(); 
  }
  else
  {
   AP_FullScreenOn=false;
   if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen(); 
   //AP_ResizeRender();
  }
 }
});
//END OF THE PRIMARY JAVASCRIPT FUNCTION FOR ACCUPAN
//Copyright Spheruler Solutions 2019-2025