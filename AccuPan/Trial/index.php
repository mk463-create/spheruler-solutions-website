<!DOCTYPE html>
<?php
 if (session_status() == PHP_SESSION_NONE) session_start();
?>
<html lang='en'>
 <head>
  <title> Spheruler - AccuPan Demo</title>
  <meta charset='UTF-8'>
  <meta name='description' content='AccuPan: Portal for Customized 
   Development and Testing of JavaScript Plugin for Accurate User Interactive
   Rendering of Scene for 360 Degree Panorama Image Inputs'>
  <meta name='keyword' content='360 Panorama Viewer, Accurate Panning, 
   Intuitive User Interface, Panorama Viewer, Panorama JavaScript, Intended 
   Movements at Zenith and Nadir, Rigorous Algorithm for Scene Rotation'>
  <meta name='copyright' content='Copyright 2019-2025, Spheruler Solutions
   Private Limited, India'>
  <meta name='author' content='Karthikeyan Thangaraj, Spheruler Solutions'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0,
   user-scalable=no'>
  <link href='Logo.ico'/>
  <style>
   body
   {
    text-align: center; font-family: Arial; font-size: 100%;
    color: black; overflow-y: hidden;
   }
   h5 { line-height:16px; display:inline; color: blue;}
   input { font-size:65%; }
   .forms
   {
    background-color: white; display: none; position: fixed;
    color: black; top: 50; opacity: 1.0; right: 15px;
    border: 3px solid #f1f1f1;  z-index: 9;	text-align: left;
   }
   .error {color: #FF0000;}
	 .popuptext 
   { 
    position: absolute; visibility: hidden; text-align: left;
    display: inline-block; width: 90%; left: 2%; top: 12%; font-size: 3vw;
    background-color: #FFFFFF; color: #000; border-radius: 12px;
    padding: 8px 8px; border-style: solid; border-color: #000; 
   }
	.show {  visibility: visible; }
   #choose-file { width: 30%;  overflow: clip;}
  </style>
 </head>
 <body>
  <div>
   <a href='https:\\www.spherulersolutions.com\AccuPan\Trial\' style='text-decoration:none'> 
   <img src='Initial.png' width='20' height='20' title='start page'> </a>
   <span class='Text' onclick='aboutAccuPan()' title='About'> <h5><u> AccuPan</u></h5>
    <span class='popuptext' id='myPopup'> 
     <b>AccuPan</b> javascript tool gives an intuitive user interactivity in
     viewing of 360-degree panorama image. <br><br>
     Load your favorite (equirectangular) image here to check:<br>
      * Accurate panning of scene with mouse, touch controls <br> 
      * Faithful zooming about the chosen point(s) <br>
      * Right rotation sense at zenith, nadir zones <br>
      * Rebound to unslanted, upright state at view limits<br> <br>
     Interested to utilize it for your panorama needs, <br>
     Register and start the trial now!
    </span>
   </span>

   <?php
    if (array_key_exists('choose-file', $_GET))
    {
     $file_name=$_GET["choose-file"];
     echo "<img id='Input1_AP' src='".$file_name."' hidden>";
    }
    else
    {
     echo
     "<input type='file' accept='image/*' id='choose-file' name='choose-file' 
      title='Select image'>
      <img id='Input1_AP' src='Input_AP.jpg' hidden>";
 
     if ($_SERVER["REQUEST_METHOD"] == "POST")
     {
      $form_type=$_POST['form_type']; 

      if ($form_type=='Reg_form')
      {
       $Name=$_POST["name"]; $Email=$_POST["email"];	
       $Organization=$_POST["organization"];
       if ($Organiztion=='Organization name') $Organization='';
       $Phone=$_POST["phone"];
       if ($Phone=='+91-1234567890') $Phone='';
       $Profession=$_POST["ProfessionSelect"];
       if ($Profession=='Custom') $Profession=$_POST['customInputProf'];
       $SecNext=false;
       $Sectors='';
       if ( (isset($_POST['Checkbox1'])) && ($_POST['Checkbox1'] == 'Enterprise') )
       {
        $Sectors=$Sectors.'Enterprise'; $SecNext=true; 
       }
       if (isset($_POST['Checkbox2']) && $_POST['Checkbox2'] == 'Events')
       {
        if ($SecNext) $Sectors=$Sectors.', '; 
        $Sectors=$Sectors.'Events'; $SecNext=true;
       }
       if (isset($_POST['Checkbox3']) && $_POST['Checkbox3'] == 'Real Estate')
       {
        if ($SecNext) $Sectors=$Sectors.', '; 
        $Sectors=$Sectors.'Real Estate'; $SecNext=true;
       }
       if (isset($_POST['Checkbox4']) && $_POST['Checkbox4'] == 'Tourism')
       {
         if ($SecNext) $Sectors=$Sectors.', '; 
        $Sectors=$Sectors.'Tourism'; $SecNext=true;
       }
       if (isset($_POST['Checkbox5']) && $_POST['Checkbox5'] == 'Others')
       {
        if (isset($_POST['customInputSect']))
        {
         if ($SecNext) $Sectors=$Sectors.', ';
         $Sectors=$Sectors.$_POST['customInputSect'];
        }
       }
       
       $X=$_POST["RX"]; $Y=$_POST["RY"]; $Z=$_POST["RZ"];
       $Dev=0.6574*$X-0.7535*$Y;
       if ( strpos($Email,"@") && ($Dev>0.995) )
       {
        $File=fopen("AccuPan_Registrations.txt","a+");
        if ($File!=false)
        {
         $Data_line=date("d-m-Y h:i:sa")."\t".$Name."\t".$Email."\t".$Organization
          ."\t".$Phone."\t".$Profession."\t".$Sectors."\n";
         fwrite($File,$Data_line);
         fclose($File);
        } 
   
        $servername = "localhost";
        $username = "Karthik";
        $database = "Spheruler_AccuPan";
        $password = "AccuPan2Spheruler";
        $conn = mysqli_connect($servername, $username, $password, $database);
        if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
        else
        {
         $Login_ID=mysqli_real_escape_string($conn,$Email);
         $sql_query="SELECT id FROM Users WHERE userID='".$Login_ID."'";
         $result = mysqli_query($conn,$sql_query);
         if (mysqli_num_rows($result)==0)
         {
          $sql_query="SELECT id FROM Users";
          $result = mysqli_query($conn,$sql_query);

          $id=mysqli_num_rows($result);
          if ($id<10)
          {
           $id=$id+1;
           $assgnPwd="@UserPwd".$id;
           $assgnUserID="User".$id;
           $Login_OTP=rand(100000,999999);
           $Login_OTP=mysqli_real_escape_string($conn,$Login_OTP);
           $Name=mysqli_real_escape_string($conn,$Name);
           $Organization=mysqli_real_escape_string($conn,$Organization);
           $Sectors=mysqli_real_escape_string($conn,$Sectors);
           $sql_query="INSERT INTO Users (id, userID, OTP, assgnPwd, 
            assgnUserID, userName, Organization, PhoneNo, Profession, Sector)
            VALUES ('".$id."', '".$Login_ID."', '".$Login_OTP."', '".$assgnPwd."', 
            '".$assgnUserID."', '".$Name."', '".$Organization."', '".$Phone."',
             '".$Profession."', '".$Sectors."')";
           if (mysqli_query($conn,$sql_query))
           {
            echo "Registration noted.";
            echo "<script> alert('Thanks for registering! Kindly check for email from accupan@spherulersolution.com with the login info.') </script>";
            date_default_timezone_set("Asia/Kolkata");
            $Subject="AccuPan Registration";
            $MailMessage="Hi ".$Name.",\n\nThanks for web registration to 'AccuPan' software - the best interactive 360 Panorama renderer of the world!.
             \n\nLogin with registered email address (User ID) and this OTP as password: ".$Login_OTP.
             "\n\nUsers can upload their panorama images and share the view link with others. With customized program settings, the apt viewing controls/experience can be reviewed and selected.
             \n\nSincere regards, \nKarthik, Spheruler Solutions (Ph: +91 8144085983)
             \nhttps://www.spherulersolutions.com/AccuPan";
            $Headers = "MIME-Version: 1.0" . "\r\n";
            $Headers .= "Content-type:text/plain;charset=UTF-8" . "\r\n";
            $Headers .= "From: accupan@spherulersolutions.com" . "\r\n";
            $Headers .= "Cc: karthik@spherulersolutions.com" . "\r\n";									   
            mail($Email,$Subject,$MailMessage,$Headers);
           }
           else echo "Registration error!";
          }
          else echo "Registration Limit exceeded!";
         }
         else echo "Email/LoginID already exists!";
        }
       
        mysqli_free_result($result);
        mysqli_close($conn);
       }
       else echo "Captcha failed!";
      }
      else
      {
       if ($form_type=='Login_form')
       {
        $X=$_POST["LX"]; $Y=$_POST["LY"]; $Z=$_POST["LZ"];
        $Dev=0.6574*$X-0.7535*$Y;
        if ($Dev>0.995)
        {
         $servername = "localhost";
         $username = "Karthik";
         $database = "Spheruler_AccuPan";
         $password = "AccuPan2Spheruler";
         $conn = mysqli_connect($servername, $username, $password, $database);
         if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
         else
         {
          if ( (isset($_POST['Reset_Pwd'])) && ($_POST['Reset_Pwd']=='yes') )
          {
           $Login_ID=mysqli_real_escape_string($conn,$_POST['Login_ID']);
           $sql_query="SELECT userName FROM Users WHERE userID='".$Login_ID."'";
           //$sql_query="SELECT id FROM Users WHERE userID='User1'";
           $result = mysqli_query($conn,$sql_query);
           if (mysqli_num_rows($result)==1)
           {
            $row = mysqli_fetch_assoc($result);
            $Name=$row['userName'];
            $Login_OTP=rand(100000,999999);
            $Login_OTP=mysqli_real_escape_string($conn,$Login_OTP);
            $sql_query="UPDATE Users SET OTP='".$Login_OTP."' WHERE userID='".$Login_ID."'";
            if (mysqli_query($conn,$sql_query))
            {
             echo "Password reset noted.";
             echo "<script> alert('Kindly check email from accupan@spherulersolution.com with the reset info.') </script>";
             date_default_timezone_set("Asia/Kolkata");
             $Subject="AccuPan User ID Password Reset";
             $MailMessage="Hi ".$Name.",\n\nRecieved password reset request.
             \n\nKindly login with your registered email address (User ID) and the OTP: ".$Login_OTP.
             "\n\nSincere regards, \nKarthik, Spheruler Solutions (Ph: +91 8144085983)
             \nhttps://www.spherulersolutions.com/AccuPan";
             $Headers = "MIME-Version: 1.0" . "\r\n";
             $Headers .= "Content-type:text/plain;charset=UTF-8" . "\r\n";
             $Headers .= "From: accupan@spherulersolutions.com" . "\r\n";
             $Headers .= "Cc: karthik@spherulersolutions.com" . "\r\n";									   
             mail($Email,$Subject,$MailMessage,$Headers);
            }
           }
           else echo "Login ID does not exist!";
          }
          else
          {
           $Login_ID=mysqli_real_escape_string($conn,$_POST['Login_ID']);
           $Login_Pwd=mysqli_real_escape_string($conn,$_POST['Login_Pwd']);
    
           $sql_query="SELECT assgnPwd, assgnUserID FROM Users WHERE userID='".$Login_ID."' AND userPwd='".$Login_Pwd."'";
           $result = mysqli_query($conn,$sql_query);
           if (mysqli_num_rows($result)==1)
           {
            $row = mysqli_fetch_assoc($result);
            $username = $row['assgnUserID'];
            $password = $row['assgnPwd'];
            mysqli_free_result($result);
            mysqli_close($conn);

            $servername = "localhost";
            //$username = $Login_ID;
            $database = "Spheruler_AccuPan";
            //$password = $Login_OTP;
            // Create connection for actual user and assigned password value
            $conn = mysqli_connect($servername, $username, $password, $database);
             // Check connection
            if (!$conn) { die("Connection failed: " . mysqli_connect_error());
            echo "Invalid Id/Pwd.";}
            else
            {
             $_SESSION['S_username']=$username;
             $_SESSION['S_password']=$password;
             mysqli_close($conn);
             header("Location: https://www.spherulersolutions.com/AccuPan/Trial/User/");
             exit;
            }
           }
           else 
           {
            mysqli_free_result($result);
            $sql_query="SELECT id FROM Users WHERE userID='".$Login_ID."' AND OTP='".$Login_Pwd."'";
            $result = mysqli_query($conn,$sql_query);
            if (mysqli_num_rows($result)==1)
            {
             $_SESSION['OTP']=$Login_Pwd;
             $_SESSION['User_ID']=$Login_ID;
             echo
             "<input type=image id='Input_Setpwd' src='SetPassword.png' width='20'
             height='20' onclick='openSetPwd()' title='Set Password'>
             ";

             echo
             "<div class='forms' id='PwdSetForm'>
              <form method='POST' action=";
             echo htmlspecialchars($_SERVER["PHP_SELF"]);
             echo
             ">
               <b>Set Password</b><br>
               <input type='hidden' name='form_type' value='SetPwd_form'>
               <input type='password' name='NewPwd' id='NewPwd' placeholder='(alphanumeric 8-20 characters)' maxlength='30' onchange='CheckPwds()' required>
               <span class='error'> * </span><br>
               <input type='password' name='ConfirmPwd' id='ConfirmPwd' placeholder='Confirm Password' 
                maxlength='30' onchange='CheckPwds()' required>
               <span class='error'> * </span><br>
               <input type='submit' name='but_PwdSetForm' id='but_PwdSetForm' value='Proceed' disabled> 
              </form>
             </div>";
             echo
             "<script>
              function openSetPwd()
              {
               if (document.getElementById('PwdSetForm').style.display == 'block') 
                document.getElementById('PwdSetForm').style.display = 'none'; 
               else document.getElementById('PwdSetForm').style.display = 'block';
              }

              function CheckPwds()
              {
               document.getElementById('but_PwdSetForm').disabled=true;
               var newPwd=document.getElementById('NewPwd').value;
               var confirmPwd=document.getElementById('ConfirmPwd').value;
               const regex = /^(?=.*[a-z])(?=.*\d).{8,20}$/;
               if (regex.test(newPwd))
               {
                if (regex.test(confirmPwd))
                {
                 if (newPwd==confirmPwd) document.getElementById('but_PwdSetForm').disabled=false;
               }
               }
              }
              </script>";
             }
            else echo "Invalid Password";
           }
           mysqli_free_result($result);
          }
          mysqli_close($conn);
         }    
        }
        else echo "Captcha failed!";
       }
       else
       {
        if ($form_type=='SetPwd_form')
        {
         $servername = "localhost";
         $username = "Karthik";
         $database = "Spheruler_AccuPan";
         $password = "AccuPan2Spheruler";
         $conn = mysqli_connect($servername, $username, $password, $database);
         $User_Pwd=mysqli_real_escape_string($conn,$_POST['NewPwd']);
         if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
         else
         {
          $Login_ID=$_SESSION['User_ID'];
          $Login_Pwd=$_SESSION['OTP'];
          $sql_query="UPDATE Users SET userPwd='".$User_Pwd."' WHERE userID='".$Login_ID."' AND OTP='".$Login_Pwd."'";
          
          if (mysqli_query($conn,$sql_query))
          {
           $sql_query="UPDATE Users SET OTP=NULL WHERE userID='".$Login_ID."' AND userPwd='".$User_Pwd."'";
           if (mysqli_query($conn,$sql_query))
           {
            echo 
            "Password updated.
             <input type=image id='Input_Login' src='Login.png' width='20'
              height='20' onclick='openLogForm()' title='Login'>
             <div class='forms' id='LoginForm' >
              <form method='POST' action=";
            echo htmlspecialchars($_SERVER["PHP_SELF"]);
            echo
            ">
               <b>User Login</b><br>
               <input type='hidden' name='form_type' value='Login_form'>
               <input type='text' name='Login_ID' placeholder='User ID (Email)' 
                maxlength='30' required>
               <span class='error'> * </span><br>
               <input type='password' name='Login_Pwd' placeholder='Password' required>
                <span class='error'> * </span><br>
               <input type='radio' name='Reset_Pwd' id='Reset_Pwd' value='yes' onclick='forgotPassword(this)'>
                <label for='Reset_Pwd'> Forgot Password? </label><br>
               <input type='hidden' name='LX' id='LX' value='0.00'>
               <input type='hidden' name='LY' id='LY' value='0.00'>
               <input type='hidden' name='LZ' id='LZ' value='0.00'>
               <i>* captcha: Pan 'Clock' to the view centre</i><br>
               <input type='submit' name='but_LoginForm' value='Login'> 
              </form>
             </div>";
            echo
            "<script>
              function openLogForm() 
              {
               if (document.getElementById('LoginForm').style.display == 'block') 
                document.getElementById('LoginForm').style.display = 'none'; 
               else document.getElementById('LoginForm').style.display = 'block';
              }
              </script>";
           }
           else echo "Password reset, unable to blank OTP!";
          }
          else echo "Unable to set password!";
          mysqli_close($conn);
         }
        }
       }
      }  
     }
     else
     {
      echo 
      "<input type=image id='Input_Register' src='Register.png' width='20'
        height='20' onclick='openRegForm()' title='Register'> &nbsp;
       <input type=image id='Input_Login' src='Login.png' width='20'
        height='20' onclick='openLogForm()' title='Login'>";
	   
      $servername = "localhost";
      $username = "Karthik";
      $database = "Spheruler_AccuPan";
      $password = "AccuPan2Spheruler";
      $conn = mysqli_connect($servername, $username, $password, $database);

      if (!$conn) { die("Server connection failed." . mysqli_connect_error()); }
      else
      {
       mysqli_close($conn);  

       echo
       "<div class='forms' id='RegForm'> 
         <form method='POST' action=";
       echo htmlspecialchars($_SERVER["PHP_SELF"]);
       echo
       " >
          <b>AccuPan User Registration</b><br>
          <input type='hidden' name='form_type' value='Reg_form'>
          <input type='text' name='name' placeholder='Name' maxlength='30' required >
          <span class='error'> * </span><br>
          <input type='text' name='email' placeholder='Email' maxlength='40' required>
          <span class='error'> * </span><br>
          <input type='text' name='organization' placeholder='Organization name' 
           maxlength='40' >
          <br>
          <input type='tel' name='phone' pattern='\+[0-9]{1,3}-[0-9]{10}' 
          placeholder='+91-1234567890'> Phone # <br>

          <label for='ProfessionSelect'> <b>Profession</b><br> </label>
          <select id='ProfessionSelect' name='ProfessionSelect'
           onchange='CustomOptionProfession()'>
           <option value=''> </option>
           <option value='Interior Designer'> Interior Design </option>
           <option value='Marketing'> Marketing </option>
           <option value='Photographer'> Photographer </option>
           <option value='Web Developer'> Web Developer </option>
           <option value='Custom'> Others </option>
          </select>
          <input type='text' id='customInputProf' name='customInputProf' 
           style='display:none'><br>
           
          <b>Usage sector</b> <br>
          <input type='checkbox' id='Checkbox1' name='Checkbox1' value='Enterprise'>
           <label for='Checkbox1'> Enterprise </label>
          <input type='checkbox' id='Checkbox2' name='Checkbox2' value='Events'>
           <label for='Checkbox2'> Events </label>
          <input type='checkbox' id='Checkbox3' name='Checkbox3' value='Real Estate'>
           <label for='Checkbox3'> Real Estate </label><br>
          <input type='checkbox' id='Checkbox4' name='Checkbox4' value='Tourism'>
           <label for='Checkbox4'> Tourism </label>
          <input type='checkbox' id='Checkbox5' name='Checkbox5' value='Others'
          onchange='CustomOptSect()'>F
          <label for='Checkbox5'> Other </label>
          <input type='text' id='customInputSect' name='customInputSect' style='display:none'> <br>
          <input type='hidden' name='RX' id='RX' value='0.00'>
          <input type='hidden' name='RY' id='RY' value='0.00'>
          <input type='hidden' name='RZ' id='RZ' value='0.00'>
           <i>* captcha: Pan 'clock' to the view centre</i><br>
          <input type='submit' name='but_RegForm' font-weight='bold' value='Register'>
         </form>
       </div>";
       echo 
       "<div class='forms' id='LoginForm' >
         <form method='POST' action=";
       echo htmlspecialchars($_SERVER["PHP_SELF"]);
       echo
       ">
          <b>User Login</b><br>
          <input type='hidden' name='form_type' value='Login_form'>
          <input type='text' name='Login_ID' placeholder='User ID (Email)' 
           maxlength='30' required>
          <span class='error'> * </span><br>
          <input type='password' name='Login_Pwd' id='Login_Pwd' placeholder='Password' required>
           <span class='error'> * </span><br>
          <input type='radio' name='Reset_Pwd' id='Reset_Pwd' value='yes' onclick='forgotPassword(this)'>
           <label for='Reset_Pwd'> Forgot Password? </label><br>
          <input type='hidden' name='LX' id='LX' value='0.00'>
          <input type='hidden' name='LY' id='LY' value='0.00'>
          <input type='hidden' name='LZ' id='LZ' value='0.00'>
           <i>* captcha: Pan 'Clock' to the view centre</i><br>
          <input type='submit' name='but_LoginForm' id='but_LoginForm' value='Login'> 
         </form>
        </div>";
       echo
       "<script>
         function openRegForm() 
         {
          if (document.getElementById('LoginForm')) 
          document.getElementById('LoginForm').style.display='none';
          if (document.getElementById('RegForm').style.display == 'block') 
          document.getElementById('RegForm').style.display = 'none'; 
          else document.getElementById('RegForm').style.display = 'block';
         }

         function openLogForm() 
         {
          if (document.getElementById('RegForm')) 
           document.getElementById('RegForm').style.display='none';
          if (document.getElementById('LoginForm').style.display == 'block') 
           document.getElementById('LoginForm').style.display = 'none'; 
          else document.getElementById('LoginForm').style.display = 'block';
         }

         function CustomOptionProfession()
         {
          const ProfSel=document.getElementById('ProfessionSelect');
          const cusInp=document.getElementById('customInputProf');
          if (ProfSel.value=='Custom')
          {
           cusInp.style.display='inline';
           cusInp.required=true;
          }
          else 
          {
           cusInp.style.display='none';
           cusInp.required=false;
          }
         }

         function CustomOptSect()
         {
          const cusInp=document.getElementById('customInputSect');
          if (document.getElementById('Checkbox5').checked)
          {
           cusInp.style.display='inline';
           cusInp.required=true;
          }
          else
          {
           cusInp.style.display='none';
           cusInp.required=false;
          }
         }
         
         function forgotPassword(radio)
         {
          if (radio.previousChecked)
          {
           radio.checked=false;
           document.getElementById('Login_Pwd').setAttribute('required','true');
           document.getElementById('but_LoginForm').value='Login';
          }
          else
          {
           if (document.getElementById('Login_Pwd').hasAttribute('required'))
            document.getElementById('Login_Pwd').removeAttribute('required');
           document.getElementById('but_LoginForm').value='Password Reset';
          }
          radio.previousChecked=radio.checked;
         } 
        </script>";
      }
     }
    }
   ?>

   <br><canvas id='Output' width='300px' height='150px'> 
   Your browser does not support the HTML5 canvas tag. </canvas>
  
   <script src='AccuPanTrial.js' defer> </script>
   
   <script> 
    function aboutAccuPan()
    {
     var AP_popup = document.getElementById('myPopup');
     AP_popup.classList.toggle('show');
    }
   </script>
   <noscript>Sorry, your browser does not support JavaScript!</noscript>
  </div>
 </body>
</html>