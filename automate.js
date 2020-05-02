#target photoshop

// Replace SmartObject’s Content and Save as JPG
// 2017, use it at your own risk
// Via @Circle B: https://graphicdesign.stackexchange.com/questions/92796/replacing-a-smart-object-in-bulk-with-photoshops-variable-data-or-scripts/93359
// JPG code from here: https://forums.adobe.com/thread/737789

// Worked on Adobe Photoshop CC 2018

const MOCKUP_PATH = '/Users/aigarscibulskis/Documents/AERNS Mobile Cases/Automation/mockups';
const SOURCE_ASSETS_PATH = '/Users/aigarscibulskis/Documents/AERNS Mobile Cases/Automation/assets/source';
const GENERATED_ASSETS_PATH = '/Users/aigarscibulskis/Documents/AERNS Mobile Cases/Automation/assets/generated';

const IMAGE_QUALITY = 10; // 1-12
const PNG_COMMPRESSION = 9 // 0-9

const timestamp = Date.now()

const mockupFolder = Folder(MOCKUP_PATH)
const sourceAssetsFolder = Folder(SOURCE_ASSETS_PATH)

const mockupFiles = mockupFolder.getFiles(function(f) {
  return (
    f instanceof File
    && f.name.match(/\.(psd)$/i) !== null
  );
});

const assetFiles = sourceAssetsFolder.getFiles(function(f) {
  return (
    f instanceof File
    && f.name.match(/\.(psd|png|tif|jpg)$/i) !== null
  );
});


// JPEG Saving options
const jpgSaveOptions = new JPEGSaveOptions();
jpgSaveOptions.embedColorProfile = true;
jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
jpgSaveOptions.matte = MatteType.NONE;
jpgSaveOptions.quality = IMAGE_QUALITY;

const pngSaveOptions = new PNGSaveOptions();
pngSaveOptions.interlaced = true;
pngSaveOptions.compression = PNG_COMMPRESSION;

app.preferences.rulerUnits = Units.PIXELS;

for (var i = 0; i < mockupFiles.length; i++) {
  var mockupFile = mockupFiles[i];
  var mockupDocument = app.open(mockupFile);
  var documentSmartObjectLayer = findSmartObjectLayer(mockupDocument);

  if (documentSmartObjectLayer === undefined) {
    alert("No Smart Object Layer")
    mockupDocument.close(SaveOptions.DONOTSAVECHANGES);
    continue;
  }

  var mockupName = mockupFile.name.match(/(.*)\.[^\.]+$/)[1];
  for (var j = 0; j < assetFiles.length; j++) {
    // Replace SmartObject
    replaceContents(mockupDocument, documentSmartObjectLayer, assetFiles[j]);

    var assetName = assetFiles[j].name.match(/(.*)\.[^\.]+$/)[1];

    // Create folder if not present
    var f = new Folder(GENERATED_ASSETS_PATH + "/" + assetName + "/mockup");
    if (!f.exists) { f.create(); }

    // Save
    if (mockupFile.name.indexOf('-transparent') > -1) {
      mockupDocument.saveAs(
        new File(GENERATED_ASSETS_PATH + "/" + assetName + "/mockup/mockup-" + mockupName + ".png"),
        pngSaveOptions,
        true,
        Extension.LOWERCASE
      );
    } else {
      mockupDocument.saveAs(
        new File(GENERATED_ASSETS_PATH + "/" + assetName + "/mockup/mockup-" + mockupName + ".jpg"),
        jpgSaveOptions,
        true,
        Extension.LOWERCASE
      );
    }
  }

  mockupDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function findSmartObjectLayer(mockupDocument) {
  for (var i = 0; i < mockupDocument.layers.length; i++) {
    var layer = mockupDocument.layers[i];

    if (layer.kind === LayerKind.SMARTOBJECT) {
      return layer;
    }
  }

  return undefined;
}

// Replace SmartObject Contents
function replaceContents(mockupDocument, smartObjectLayer, file) {
  app.preferences.rulerUnits = Units.PIXELS;
  mockupDocument.activeLayer = smartObjectLayer;

  executeAction(stringIDToTypeID("placedLayerEditContents"), undefined, DialogModes.ERROR);

  var soDocument = app.activeDocument;
  var soWidth = soDocument.width.value;
  var soHeight = soDocument.height.value;

  var imageFile = app.open(file);
  imageFile.artLayers.add();
  var d = new ActionDescriptor();
  d.putBoolean(stringIDToTypeID("duplicate"), true);
  executeAction(stringIDToTypeID("mergeVisible"), d, DialogModes.NO);
  var imageWidth = imageFile.width.value;
  var imageHeight = imageFile.height.value;

  var newImageWidth = imageWidth
  var newImageHeight = imageHeight

  if (soWidth / imageWidth > soHeight / imageHeight) {
    newImageWidth = soWidth
    newImageHeight = soWidth / imageWidth * imageHeight
    imageFile.resizeImage(newImageWidth, newImageHeight, soDocument.resolution, ResampleMethod.BICUBIC);
  } else {
    newImageWidth = soHeight / imageHeight * imageWidth
    newImageHeight = soHeight
    imageFile.resizeImage(newImageWidth, newImageHeight, soDocument.resolution, ResampleMethod.BICUBIC);
  }

  imageFile.activeLayer.duplicate(soDocument.layers[0], ElementPlacement.PLACEBEFORE);
  imageFile.close(SaveOptions.DONOTSAVECHANGES);

  // Hides all except one / selected (?)
  var d = new ActionDescriptor();
  var list = new ActionList();
  var r = new ActionReference();
  r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
  list.putReference(r);
  d.putList(stringIDToTypeID("null"), list);
  d.putBoolean(stringIDToTypeID("toggleOthers"), true);
  executeAction(stringIDToTypeID("show"), d, DialogModes.NO);

  try {
    // Delete Hidden Layers
    var d = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("hidden"));
    d.putReference(stringIDToTypeID("null"), r);
    executeAction(stringIDToTypeID("delete"), d, DialogModes.NO);
  } catch (error) { }

  soDocument.activeLayer.translate(
    -(newImageWidth-soWidth)/2,
    -(newImageHeight-soHeight)/2,
  );

  soDocument.close(SaveOptions.SAVECHANGES);
};
