/*
  Rhino script to apply a patch to a file using SXOOP.patch module
  rpatch.js reads an original file, applys a patch and writes the patched
  content to the original file (per default behaviour of `patch` command
  
  To call from an Ant build script...
 
  <java jar="js.jar" fork="true" failonerror="true">
    <arg value="rpatch.js"/>
    <arg value="{path-to-original-file}"/>
    <arg value="{path-to-patch-file}"/>
  </java>
*/
if (arguments.length != 2){
    print("Usage: java -jar {path-to}/js.jar rpatch.js {original-file} {patch-file}");
    quit();
}
load("sxoop_patch.js");
var originalFile = arguments[0];
var patchFile = arguments[1];
var originalText = readFile(originalFile);
var patchText = readFile(patchFile);
var patchId = SXOOP.patch.read(patchText);
var newText = SXOOP.patch.apply(patchId,originalText);
var out = new java.io.FileWriter(originalFile);
out.write(newText);
out.close();
print("patched file " + originalFile + " using " + patchFile + ".");
quit();