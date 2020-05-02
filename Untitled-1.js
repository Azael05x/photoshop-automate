// var fileList = ["D:/PsdFile/01_coffee mug mockup_white/01_coffee mug mockup_white.psd", "D:/PsdFile/02_coffee mug mockup_color/02_coffee mug mockup_color.psd", "D:/PsdFile/369-mug-mockup/369-mug-mockup.psd"]
var fileList =
[
  "D:/PsdFile/01_coffee mug mockup_white/01_coffee mug mockup_white.psd"
]
const doc = {};
for (var i = 0; i < fileList.length; i++)
{
  var fileRef = new File(fileList[i]);
  app.open(fileRef);
  Run();
}


function Run() {
  if (app.documents.length > 0)
  {
    var myDocument = app.activeDocument;
    var theName = myDocument.name.match(/(.*)\.[^\.]+$/)[1];
    var thePath = myDocument.path;

    var theLayer = myDocument.activeLayer;
    var startRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    // jpg options
    var jpgopts = new JPEGSaveOptions();
    jpgopts.embedProfile = true;
    jpgopts.formatOptions = FormatOptions.STANDARDBASELINE;
    jpgopts.matte = MatteType.NONE;
    jpgopts.quality = 10;
    // check if layer is smart object;
    if (theLayer.kind != "LayerKind.SMARTOBJECT")
    {
      alert("selected layer is not a smart object")
    }
    else
    {
      // Select Files;
      var inFolder = new Folder(thePath + "/image")
      if (inFolder != null)
      {
        var theFiles = inFolder.getFiles(/\.(jpg|tif|psd|bmp|gif|png|)$/i);
      }
    }
    if (theFiles)
    {
      // work through the array;
      for (var m = 0; m < theFiles.length; m++)
      {
        var theNewName = theFiles[m].name.match(/(.*)\.[^\.]+$/)[1];
        // open smart object;
        var smartObject = openSmartObject(theLayer);

        var theNewOne = placeScaleRotateFile(theFiles[m], 0, 0, 85, 85, 0);

        replace_fit_smart_object(theFiles[m], AnchorPosition.MIDDLECENTER);

        //scaleLayerToFitCanvas();
        hideOthers();
        //
        // close;
        smartObject.close(SaveOptions.SAVECHANGES);

        //Create folder if not exist
        var folder1 = Folder(thePath + "/Output/");
        if (!folder1.exists) folder1.create();
        sfwPNG24(new File(thePath + "/Output/" + theName + "_" + theNewName + ".png"));
      }
    }
  }
}

////// place //////
function placeScaleRotateFile(file, xOffset, yOffset, theXScale, theYScale, theAngle)
{
  // =======================================================
  var idPlc = charIDToTypeID("Plc ");
  var desc5 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  desc5.putPath(idnull, new File(file));
  var idFTcs = charIDToTypeID("FTcs");
  var idQCSt = charIDToTypeID("QCSt");
  var idQcsa = charIDToTypeID("Qcsa");
  desc5.putEnumerated(idFTcs, idQCSt, idQcsa);
  var idOfst = charIDToTypeID("Ofst");
  var desc6 = new ActionDescriptor();
  var idHrzn = charIDToTypeID("Hrzn");
  var idPxl = charIDToTypeID("#Pxl");
  desc6.putUnitDouble(idHrzn, idPxl, xOffset);
  var idVrtc = charIDToTypeID("Vrtc");
  var idPxl = charIDToTypeID("#Pxl");
  desc6.putUnitDouble(idVrtc, idPxl, yOffset);
  var idOfst = charIDToTypeID("Ofst");
  desc5.putObject(idOfst, idOfst, desc6);
  var idWdth = charIDToTypeID("Wdth");
  var idPrc = charIDToTypeID("#Prc");
  desc5.putUnitDouble(idWdth, idPrc, theYScale);
  var idHght = charIDToTypeID("Hght");
  var idPrc = charIDToTypeID("#Prc");
  desc5.putUnitDouble(idHght, idPrc, theXScale);
  var idAngl = charIDToTypeID("Angl");
  var idAng = charIDToTypeID("#Ang");
  desc5.putUnitDouble(idAngl, idAng, theAngle);
  var idLnkd = charIDToTypeID("Lnkd");
  desc5.putBoolean(idLnkd, true);
  executeAction(idPlc, desc5, DialogModes.NO);
  return app.activeDocument.activeLayer;
};
////// scale layer to fit canvas //////
function scaleLayerToFitCanvas()
{
  var ref = new ActionReference();
  ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("bounds"));
  ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  var layerDesc = executeActionGet(ref);
  var theBounds = layerDesc.getObjectValue(stringIDToTypeID("bounds"));
  var layerX = theBounds.getUnitDoubleValue(stringIDToTypeID("left"));
  var layerY = theBounds.getUnitDoubleValue(stringIDToTypeID("top"));
  var layerWidth = theBounds.getUnitDoubleValue(stringIDToTypeID("right")) - layerX;
  var layerHeight = theBounds.getUnitDoubleValue(stringIDToTypeID("bottom")) - layerY;
  var ref1 = new ActionReference();
  ref1.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  var docDesc = executeActionGet(ref1);
  var docWidth = docDesc.getUnitDoubleValue(stringIDToTypeID("width"));
  var docHeight = docDesc.getUnitDoubleValue(stringIDToTypeID("height"));
  var docRes = docDesc.getInteger(stringIDToTypeID("resolution"));
  var scaleX = docWidth / layerWidth * docRes / 72 * 85;
  var scaleY = docHeight / layerHeight * docRes / 72 * 85;
  var theScale = Math.min(scaleX, scaleY);
  layerX = ((docWidth * docRes / 144) - (layerX + layerWidth / 2));
  layerY = ((docHeight * docRes / 144) - (layerY + layerHeight / 2));
  var idTrnf = charIDToTypeID("Trnf");
  var desc24 = new ActionDescriptor();
  desc24.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
  var idOfst = charIDToTypeID("Ofst");
  var desc25 = new ActionDescriptor();
  var idHrzn = charIDToTypeID("Hrzn");
  var idPxl = charIDToTypeID("#Pxl");
  desc25.putUnitDouble(idHrzn, idPxl, layerX);
  var idVrtc = charIDToTypeID("Vrtc");
  desc25.putUnitDouble(idVrtc, idPxl, layerY);
  desc24.putObject(idOfst, idOfst, desc25);
  var idWdth = charIDToTypeID("Wdth");
  var idPrc = charIDToTypeID("#Prc");
  desc24.putUnitDouble(idWdth, idPrc, theScale);
  var idHght = charIDToTypeID("Hght");
  desc24.putUnitDouble(idHght, idPrc, theScale);
  executeAction(idTrnf, desc24, DialogModes.NO);
};
////// open smart object //////
function openSmartObject(theLayer)
{
  if (theLayer.kind == "LayerKind.SMARTOBJECT")
  {
    var idplacedLayerEditContents = stringIDToTypeID("placedLayerEditContents");
    var desc2 = new ActionDescriptor();
    executeAction(idplacedLayerEditContents, desc2, DialogModes.NO);
  };
  return app.activeDocument
};
////// hide others //////
function hideOthers()
{
  var idShw = charIDToTypeID("Shw ");
  var desc2 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  var list1 = new ActionList();
  var ref1 = new ActionReference();
  var idLyr = charIDToTypeID("Lyr ");
  var idOrdn = charIDToTypeID("Ordn");
  var idTrgt = charIDToTypeID("Trgt");
  ref1.putEnumerated(idLyr, idOrdn, idTrgt);
  list1.putReference(ref1);
  desc2.putList(idnull, list1);
  var idTglO = charIDToTypeID("TglO");
  desc2.putBoolean(idTglO, true);
  executeAction(idShw, desc2, DialogModes.NO);
};


function replace_fit_smart_object(file, anchor) {
  try {
    var tmp = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    var layer = activeDocument.activeLayer;

    var l0 = layer.bounds[0];
    var t0 = layer.bounds[1];
    var r0 = layer.bounds[2];
    var b0 = layer.bounds[3];
    var x0 = (l0+r0)/2;
    var y0 = (t0+b0)/2;

    var w0 = layer.bounds[2]-layer.bounds[0];
    var h0 = layer.bounds[3]-layer.bounds[1];

    var d = new ActionDescriptor();
    d.putPath(stringIDToTypeID("null"), file);
    executeAction(stringIDToTypeID("placedLayerReplaceContents"), d, DialogModes.NO);

    var w1 = layer.bounds[2]-layer.bounds[0];
    var h1 = layer.bounds[3]-layer.bounds[1];

    if (w1/w0 > h1/h0) layer.resize(100*w0/w1, 100*w0/w1);
    else               layer.resize(100*h0/h1, 100*h0/h1);

    var l1 = layer.bounds[0];
    var t1 = layer.bounds[1];
    var r1 = layer.bounds[2];
    var b1 = layer.bounds[3];
    var x1 = (l1+r1)/2;
    var y1 = (t1+b1)/2;

    switch (anchor)
    {
      case AnchorPosition.BOTTOMCENTER: layer.translate(x0-x1, b0-b1); break;
      case AnchorPosition.BOTTOMLEFT  : layer.translate(l0-l1, b0-b1); break;
      case AnchorPosition.BOTTOMRIGHT : layer.translate(r0-r1, b0-b1); break;

      case AnchorPosition.MIDDLECENTER: layer.translate(x0-x1, y0-y1); break;
      case AnchorPosition.MIDDLELEFT  : layer.translate(l0-l1, y0-y1); break;
      case AnchorPosition.MIDDLERIGHT : layer.translate(r0-r1, y0-y1); break;

      case AnchorPosition.TOPCENTER   : layer.translate(x0-x1, t0-t1); break;
      case AnchorPosition.TOPLEFT     : layer.translate(l0-l1, t0-t1); break;
      case AnchorPosition.TOPRIGHT    : layer.translate(r0-r1, t0-t1); break;
    }

    app.preferences.rulerUnits = tmp;

    return true;
  }
  catch (e) {
    alert(e); return false;
  }
}
