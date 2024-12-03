document
  .getElementsByClassName("button")[0]
  .addEventListener("click", postInput);
function checkInput() {
  var value = document.querySelector("#email").value;
  var validateEmail = ["@cs.hku.hk", "@connect.hku.hk"];
  var isValid = false;
  for (var item of validateEmail) {
    if (
      value
        .substring(value.length - item.length, value.length)
        .includes(item) &&
      value.length > item.length
    ) {
      isValid = true;
      break;
    }
  }
  if (!isValid) {
    let hint = document.querySelector(".hiddenHint");
    hint.style.display = "block";
    hint.style.border = "1px solid black";
    hint.style.backgroundColor = "white";
    hint.style.borderRadius = "10px";
    document.getElementsByClassName("buttonHolder")[0].style.display = "none";
  }
  if (value.length < 1) {
    document.querySelector(".hiddenHint").style.display = "none";
    document.getElementsByClassName("buttonHolder")[0].style.display = "block";
  }
  if (isValid) {
    document.querySelector(".hiddenHint").style.display = "none";
    document.getElementsByClassName("buttonHolder")[0].style.display = "block";
  }
}

function postInput(event) {
  event.preventDefault();
  var inputEmail = document.querySelector("#email").value;
  if (email.length < 1) {
    alert("Please enter your email dumbass");
    return;
  }
  var checkEmail = { email: inputEmail };
  console.log(checkEmail);
  fetch("/login", {
    method: "POST",
    body: JSON.stringify(checkEmail),
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        if (data.msg === "successful") {
          console.log(data.msg);
          console.log("Successfully post");
          msg =
            "<p>Please check your email to get the URL for accessing the course info page</p>";
          let hiddenMsg = document.getElementsByClassName("hiddenMsg")[0];
          hiddenMsg.style.display = "block";
          hiddenMsg.style.backgroundColor = "#AAAAFF";
          hiddenMsg.style.border = "2px solid purple";
          hiddenMsg.innerHTML = msg;
          let errorMsg = document.getElementsByClassName("errorMsg")[0];
          console.log(errorMsg);
          if (errorMsg) {
            errorMsg.style.display = "none";
          }
        } else if (data.msg === "bruh") {
          console.log(data.msg);
          console.log("Successfully bruh");
          msg =
            "<p>Unknow user - we don't have record for " +
            inputEmail +
            " in the system</p>";
          let hiddenMsg = document.getElementsByClassName("hiddenMsg")[0];
          hiddenMsg.style.display = "block";
          hiddenMsg.style.backgroundColor = "#FF7575";
          hiddenMsg.style.border = "2px solid red";
          hiddenMsg.innerHTML = msg;
          let errorMsg = document.getElementsByClassName("errorMsg")[0];
          console.log(errorMsg);
          if (errorMsg) {
            errorMsg.style.display = "none";
          }
        } else {
          alert("Error: Fatal error with" + data.msg);
        }
      });
    } else {
      alert("HTTP return status: " + response.status);
    }
  });
}
var errorMsg = "{{errorMsg}}";
console.log(errorMsg);
if (errorMsg === "Fail to authenticate - unknow user") {
  console.log(errorMsg);
  console.log("Successfully bruh");
  msg = "<p>Unknown user - cannot identify the student." + "</p>";
  let hiddenMsg = document.getElementsByClassName("hiddenMsg")[0];
  hiddenMsg.style.display = "block";
  hiddenMsg.style.backgroundColor = "#FF7575";
  hiddenMsg.style.border = "2px solid red";
  hiddenMsg.innerHTML = msg;
} else if (errorMsg === "Fail to authenticate - incorrect secret") {
  console.log(errorMsg);
  console.log("Successfully bruh");
  msg = "<p>Fail to authenticate - incorrect secret!" + "</p>";
  let hiddenMsg = document.getElementsByClassName("hiddenMsg")[0];
  hiddenMsg.style.display = "block";
  hiddenMsg.style.backgroundColor = "#FF7575";
  hiddenMsg.style.border = "2px solid red";
  hiddenMsg.innerHTML = msg;
} else if (errorMsg === "Fail to authenticate - token expired") {
  console.log(errorMsg);
  console.log("Successfully bruh");
  msg = "<p>Fail to authenticate - token expired!" + "</p>";
  let hiddenMsg = document.getElementsByClassName("hiddenMsg")[0];
  hiddenMsg.style.display = "block";
  hiddenMsg.style.backgroundColor = "#FF7575";
  hiddenMsg.style.border = "2px solid red";
  hiddenMsg.innerHTML = msg;
}
