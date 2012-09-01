//
// public interface: SXOOP.patch is a bare-bones implementation of 'patch'.
// it will use the patch output as given and does not try to do any kind of
// matching if the lines do not match up. (it ignores the original content)
// E.g. use `diff original-file new-file > diff.patch`
// SXOOP.patch will read the output from a standard diff invocation and do a 
// dumb patch based on the diff output.
// This might be useful in environments where 'patch' is not available (windows)
// See accompanying rpatch.js file for usage in Rhino.
//
// Walter Higgins 20120901
//
var SXOOP = SXOOP || {};
SXOOP.patch = 
{
    //
    // read takes a normal diff output text as a parameter
    // and returns a number which is used to identify a patch.
    // (pass the number to the apply function).
    //
    /* Number */ read: function(/* String */ diffOutput){},

    //
    // apply a patch to to a string. Returns a new string containing
    // patched content.
    //
    apply: function(/* Number */ patchId, /* String */ oldText){}
};
//
// private implementation
//
(function(){
    var patches = [];
    var _read = function(/* String */ patchString){
        var lines = patchString.split(/\n/);
        var result = [];
        var diff = null;
        for (var i = 0;i < lines.length; i++){
            var line = lines[i];
            var isDiffHeader = line.match(/^([0-9,]+)([a,c,d])([0-9,]+)/);
            if (isDiffHeader){
                var ol = isDiffHeader[1].split(",");
                var chg = isDiffHeader[2];
                var nl = isDiffHeader[3].split(",");
                diff = {ol: ol, op: chg, nl: nl,old_lines: [],new_lines: []};
                result.push(diff);
            }else{
                if (diff && line.match(/^< /))
                    diff.old_lines.push(line.substring(2));
                if (diff && line.match(/^> /))
                    diff.new_lines.push(line.substring(2));
            }
        }
        patches.push(result);
        return patches.length-1;
    };
    var _apply = function(/* Number */ patchId, /* String */ oldText){
        var patch = patches[patchId];
        var oldTextLines = oldText.split(/\n/);
        var result = oldText.split(/\n/);
        for (var i = 0;i < patch.length; i++)
        {
            var start = parseInt(patch[i].nl[0]) -1;
            if (patch[i].op == "d")
                var deleted = result.splice(start+1,patch[i].old_lines.length);
            if (patch[i].op == "c"){
                var so = parseInt(patch[i].ol[0]) -1;
                var eo = parseInt(patch[i].ol[1]) -1;
                var ol = 1;
                if (eo)
                    ol += eo - so;
                // a change is a delete then an add
                result.splice(start,ol);
                for (var j = 0;j < patch[i].new_lines.length; j++){
                    result.splice(start+j,0,patch[i].new_lines[j]);
                }
            }
            if (patch[i].op == "a"){
                for (var j= 0; j < patch[i].new_lines.length; j++){
                    result.splice(start+j,0,patch[i].new_lines[j]);
                }
            }
        }
        return result.join("\n");
    };
    SXOOP.patch.read = _read;
    SXOOP.patch.apply = _apply;
}());
