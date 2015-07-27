/*
Other terminal ideas:
Undo, Redo, support Ctrl+C, Ctrl+X, Ctrl+V,
Color support
Possible syntax highlighting
*/
var fullscreen = false;

var new_prompt = "duck> ";
var continue_prompt = "    > ";

var source_code = "";
var program = {};
var prog_out = "";

function println(text) 
{
    prevOutputBox.textContent = prevOutputBox.textContent + text + "\n";
}
function output(text)
{
    prevOutputBox.textContent = prevOutputBox.textContent + text;
}
program.output = println;
program.print = output;


function RunProgram(buffer)
{
  source_code = source_code + buffer + "\n";
  var result = TestParse(source_code);
  
  if (result == -1) {
    println("Syntax error.\n");
    source_code = "";
    output(new_prompt);
  } else if (result == 1) {
    RunAndPrintValue(source_code);
    source_code = "";
    output(new_prompt);
  } else {
    output(continue_prompt);
  }
}



var blinkstate;
function Blink() 
{
    var cursor = caretElement;
    blinkstate = (blinkstate + 1) % 2;
    if (blinkstate) {
      cursor.style.background = "black";
      cursor.style.color = "white";
    } else {
      cursor.style.background = "white";
      cursor.style.color = "black";
    }
}

var timerid;
function StartBlink()
{
  if (timerid !== undefined)
  {
      window.clearInterval(timerid);
  }

  timerid = window.setInterval(Blink, 600);
  blinkstate = 1;
  Blink();
}

var prevInputs = [];
var prevInputCount = 0;
var prevInputIndex = 0;

function ResetLine()
{
    prevInputIndex = prevInputCount;
}

function MoveLineUp() 
{ 
    if (prevInputIndex > 0) {
        buffer = prevInputs[prevInputIndex - 1];
        prevInputIndex = prevInputIndex - 1;
        bufferLen = buffer.length;
        caretPos = 0;
        UpdateBuffers();
    }
}

function MoveLineDown() 
{ 
    if (prevInputIndex < prevInputCount - 1)
    {
        buffer = prevInputs[prevInputIndex + 1];
        prevInputIndex = prevInputIndex + 1;
        bufferLen = buffer.length
        caretPos = 0;
        UpdateBuffers();
    }
}

var terminalArea;
var prevOutputBox;
var preTextBox;
var postTextBox;
var caretElement;

var buffer = "";
var bufferLen = 0;
var caretPos = 0;

function UpdateBuffers()
{
    var pre = buffer.substring(0, caretPos);
    var post = buffer.substring(caretPos+1, bufferLen);
    var caret = buffer.substring(caretPos, caretPos + 1);
    preTextBox.textContent = pre;
    if (caret == "\n") {
        caretElement.innerHTML = "&nbsp;";
        postTextBox.textContent = "\n" + post;
        if (fullscreen) postTextBox.textContent += "\n\n";
    } else if (caretPos == bufferLen)
    {
        caretElement.innerHTML = "&nbsp;";
        postTextBox.textContent = "";
        if (fullscreen) postTextBox.textContent = "\n\n"
    }
    else
    {
        caretElement.innerHTML = caret;
        postTextBox.textContent = post + "";
        if (fullscreen) postTextBox.textContent += "\n\n";
    }
    if (fullscreen)
    {
        window.scrollTo(0,document.body.scrollHeight);
    } else {
        terminalArea.scrollTop = terminalArea.scrollHeight;
    }
    StartBlink();
}

function InsertCharacter(character)
{
    if (caretPos == bufferLen)
    {
        buffer = buffer + character;
        bufferLen = bufferLen + 1;
        caretPos = caretPos + 1;
    } else {
        var pre = buffer.substring(0, caretPos);
        var post = buffer.substring(caretPos, bufferLen);
        buffer = pre + character + post;
        bufferLen = bufferLen + 1;
        caretPos = caretPos + 1;
    }
    
    ResetLine();
}

function InsertTab()
{
    InsertCharacter(" ");
    InsertCharacter(" ");
    InsertCharacter(" ");
    InsertCharacter(" ");
    UpdateBuffers();
}

function PressEnter()
{
    var source = buffer;
    prevInputs[prevInputCount] = buffer;
    prevInputCount = prevInputCount + 1;
    prevInputIndex = prevInputCount;
    output(buffer);
    output("\n");
    buffer = "";
    bufferLen = 0;
    caretPos = 0;
    UpdateBuffers();
    RunProgram(source);

    if (fullscreen)
    {
        window.scrollTo(0,document.body.scrollHeight);
    } else {
        terminalArea.scrollTop = terminalArea.scrollHeight;
    }
}

function DeletePress()
{
    if (caretPos < bufferLen)
    {
        buffer = buffer.substring(0, caretPos) + buffer.substring(caretPos+1, bufferLen);
        bufferLen = bufferLen - 1;
        UpdateBuffers();
    }
    
    ResetLine();
}

function Backspace()
{
    if (caretPos > 0)
    {
        buffer = buffer.substring(0, caretPos-1) 
          + buffer.substring(caretPos, bufferLen);
        bufferLen = bufferLen - 1;
        caretPos = caretPos - 1;
        UpdateBuffers();
    }
    
    ResetLine();
}


function MoveCaretLeft()
{
    if (caretPos > 0)
    {
        caretPos = caretPos - 1;
        UpdateBuffers();
    }
}

function MoveCaretRight()
{
    if (caretPos < bufferLen)
    {
        caretPos = caretPos + 1;
        UpdateBuffers();
    }
}

function Home()
{
    caretPos = 0;
    UpdateBuffers();
}

function End()
{
    caretPos = bufferLen;
    UpdateBuffers();
}

function SpecialKeyHandler(e)
{
    var key = /*e.keyCode ? e.keyCode :*/ e.which;
    switch (key)
    {
      case  8: Backspace(); e.preventDefault(); break;
      case  9: InsertTab(); e.preventDefault(); break;
      case 13: PressEnter(); e.preventDefault(); break;
      case 37: MoveCaretLeft(); e.preventDefault(); break;
      case 39: MoveCaretRight(); e.preventDefault(); break;
      case 38: MoveLineUp(); e.preventDefault(); break;
      case 40: MoveLineDown(); e.preventDefault(); break; 
      case 46: DeletePress(); e.preventDefault(); break;
      case 35: End(); e.preventDefault(); break;
      case 36: Home(); e.preventDefault(); break;
    }
    //e.preventDefault();
}

/* Used on key press */
function KeyHandler(e) 
{
    var key = /*e.keyCode ? e.keyCode :*/ e.which;
    if (key >= 32 && key <= 126) 
    {
        if (!e.ctrlKey && !e.metaKey && !e.altKey)
        {
            var character = String.fromCharCode(key);
            InsertCharacter(character);
            UpdateBuffers();
        }
        e.preventDefault();
    } else {
      switch (key)
      {
        case  8:
        case  9:
        case 13: 
        case 37: 
        case 39: 
        case 38: 
        case 40: 
        case 46: 
        case 35: 
        case 36: 
          e.preventDefault()
          break;
      }
    }
};

var MOTDWelcome = "Welcome to the Duck programming language interactive interpreter!\n" +
                  "This virtual terminal will allow you to test your Duck programs.";
function Start()
{
    StartUpDuckRuntime();

    terminalArea = document.getElementById("terminal");
    prevOutputBox = document.getElementById("prev-output");
    preTextBox = document.getElementById("pre-text");
    postTextBox = document.getElementById("post-text");
    caretElement = document.getElementById("cursor");
    
    // StartBlink();
    
    document.keypress = document.onkeypress = KeyHandler;
    document.keydown = document.onkeydown = SpecialKeyHandler;
    
    /*output("Welcome to the Duck programming language interactive interpreter! ");
    output("This virtual terminal will allow you to test your Duck programs.");*/
    output(MOTDWelcome);
    println("    ");
    output(new_prompt);
    UpdateBuffers();
}
