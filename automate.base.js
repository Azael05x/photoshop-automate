// Replace SmartObject’s Content and Save as JPG
// 2017, use it at your own risk
// Via @Circle B: https://graphicdesign.stackexchange.com/questions/92796/replacing-a-smart-object-in-bulk-with-photoshops-variable-data-or-scripts/93359
// JPG code from here: https://forums.adobe.com/thread/737789

#target photoshop
if (app.documents.length > 0) {
  var myDocument = app.activeDocument;
  var theName = myDocument.name.match(/(.*)\.[^\.]+$/)[1];
  var thePath = myDocument.path;
  var theLayer = myDocument.activeLayer;
  // JPG Options;
  jpgSaveOptions = new JPEGSaveOptions();
  jpgSaveOptions.embedColorProfile = true;
  jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
  jpgSaveOptions.matte = MatteType.NONE;
  jpgSaveOptions.quality = 8;
  // Check if layer is SmartObject;
  if (theLayer.kind != "LayerKind.SMARTOBJECT") {
    alert("selected layer is not a smart object")
  } else {
    // Select Files;
    if ($.os.search(/windows/i) != -1) {
      var theFiles = File.openDialog("please select files", "*.psd;*.tif;*.jpg", true)
    } else {
      var theFiles = File.openDialog("please select files", getFiles, true)
    };
    if (theFiles) {
      for (var m = 0; m < theFiles.length; m++) {
        // Replace SmartObject
        theLayer = replaceContents(theFiles[m], theLayer);
        var theNewName = theFiles[m].name.match(/(.*)\.[^\.]+$/)[1];
        // Save JPG
        myDocument.saveAs((new File(thePath + "/" + theName + "_" + theNewName + ".jpg")), jpgSaveOptions, true,Extension.LOWERCASE);
      }
    }
  }
};
// Get PSDs, TIFs and JPGs from files
function getFiles(theFile) {
  if (theFile.name.match(/\.(psd|tif|jpg)$/i) != null || theFile.constructor.name == "Folder") {
    return true
  };
};
// Replace SmartObject Contents
function replaceContents(newFile, theSO) {
  app.activeDocument.activeLayer = theSO;
  // =======================================================
  var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
  var desc3 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  desc3.putPath(idnull, new File(newFile));
  var idPgNm = charIDToTypeID("PgNm");
  desc3.putInteger(idPgNm, 1);
  executeAction(idplacedLayerReplaceContents, desc3, DialogModes.NO);
  return app.activeDocument.activeLayer
};
