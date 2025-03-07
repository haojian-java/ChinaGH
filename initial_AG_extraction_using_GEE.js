/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var roi = ee.FeatureCollection("users/haojian0324/xzq");//Import the study area
var ag = ee.FeatureCollection("projects/enhanced-prism-399609/assets/ag_xzq_year");//Import AG(agricultural plastic greenhouse) sample points
var fag = ee.FeatureCollection("projects/enhanced-prism-399609/assets/nag_xzq_year");//Import non-AG (non-agricultural plastic greenhouse) samples points
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//Cloud masking function
function cloudfree_landsat (image){
  var saturationMask = image.select('QA_RADSAT').eq(0);
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  
  return image.addBands(opticalBands, null, true)
      .addBands(thermalBand, null, true)
      .updateMask(saturationMask);
}
    
var year = 2015;

var col = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
.map(cloudfree_landsat)
.filterDate(year + '-01-01',year + '-12-31')
.filterBounds(roi)

var colorizedVis = {
  bands: ['SR_B3', 'SR_B2', 'SR_B1'],
  min: 0.0,
  max: 0.3,
};

Map.addLayer(col.mean().clip(roi), colorizedVis, 'col');
Map.addLayer(sddp1, '', 'yb');

// Constructing positive indicators and reverse indicators
// indicators
// landsat 7
function NDWI(img){
  var nir = img.select('SR_B4');
  var green = img.select('SR_B2');
  var ndwi = img.expression(
    '(SR_B2-SR_B4)/(SR_B2+SR_B4)',
    {
      'SR_B4':nir,
      'SR_B2':green
    });
    return ndwi;
}

function MNDWI(img){
  var swir1 = img.select('SR_B5');
  var green = img.select('SR_B2');
  var mndwi = img.expression(
    '(SR_B2-SR_B5)/(SR_B2+SR_B5)',
    {
      'SR_B5':swir1,
      'SR_B2':green
    });
    return mndwi;
}

function EWI(img){
  var swir1 = img.select('SR_B5')
  var nir = img.select('SR_B4');
  var green = img.select('SR_B2');
  var ewi = img.expression(
    '(SR_B2-SR_B4-SR_B5)/(SR_B2+SR_B4+SR_B5)',
    {
      'SR_B5':swir1,
      'SR_B4':nir,
      'SR_B2':green
    });
    return ewi;
}

function NDBI(img){
  var swir1 = img.select('SR_B5');
  var nir = img.select('SR_B4');
  var ndbi = img.expression(
    '(SR_B5-SR_B4)/(SR_B5+SR_B4)',
    {
      'SR_B5':swir1,
      'SR_B4':nir
    });
    return ndbi;
}

function NDVI(img){
  var nir = img.select('SR_B4');
  var red = img.select('SR_B3');
  var ndvi = img.expression(
    '(SR_B4-SR_B3)/(SR_B4+SR_B3)',
    {
      'SR_B4':nir,
      'SR_B3':red
    });
    return ndvi;
}

function SAVI(img){
  var nir = img.select('SR_B4');
  var red = img.select('SR_B3');
  var savi = img.expression(
    '(1 + 0.2) * float(nir - red)/ (nir + red + 0.2)',
    {
      'nir':nir,
      'red':red
    });
    return savi;
}


function BSI(img){
  var bsi = img.expression(
    '((RED + SWIR) - (NIR + GREEN)) / ((RED + SWIR) + (NIR + GREEN))',
    {
      'GREEN':img.select('SR_B2'),
      'NIR':img.select('SR_B4'),
      'RED':img.select('SR_B3'),
      'SWIR':img.select('SR_B5')
    });
    return bsi;
}



function ENDISI(img){
  var endisi = img.expression(
    '((2*blue+swir2)/2-(red+nir+swir1)/3)/((2*blue+swir2)/2+(red+nir+swir1)/3)',
    {
      'blue':img.select('SR_B1'),
      'nir':img.select('SR_B4'),
      'red':img.select('SR_B3'),
      'swir1':img.select('SR_B5'),
      'swir2':img.select('SR_B7')
    });
    return endisi;
}

function LSWI(img){
  var lswi = img.expression(
    '(nir-swir1)/(nir+swir1)',
    {
      'blue':img.select('SR_B1'),
      'nir':img.select('SR_B4'),
      'red':img.select('SR_B3'),
      'swir1':img.select('SR_B5'),
      'swir2':img.select('SR_B7')
    });
    return lswi;
}


function EVI(img){
  var evi = img.expression(
    '2.5*(nir-red)/(nir+6*red-7*blue+1)',
    {
      'blue':img.select('SR_B1'),
      'nir':img.select('SR_B4'),
      'red':img.select('SR_B3'),
      'swir1':img.select('SR_B5'),
      'swir2':img.select('SR_B7')
    });
    return evi;
}


function NDTI(img){
  var ndti = img.expression(
    '(swir1-swir2)/(swir1+swir2)',
    {
      'blue':img.select('SR_B1'),
      'nir':img.select('SR_B4'),
      'red':img.select('SR_B3'),
      'swir1':img.select('SR_B5'),
      'swir2':img.select('SR_B7')
    });
    return ndti;
}

function NDSVI(img){
  var ndsvi = img.expression(
    '(swir1-red)/(swir1+red)',
    {
      'blue':img.select('SR_B1'),
      'nir':img.select('SR_B4'),
      'red':img.select('SR_B3'),
      'swir1':img.select('SR_B5'),
      'swir2':img.select('SR_B7')
    });
    return ndsvi;
}

// satellite data
var l8_col = ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')

// Monthly composite imagery。
// 1
var img_1 = ee.List([])
for (var i=year; i<year1; i++){
  var image1 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-1-1", i+"-1-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_1 = img_1.add(image1);
}
img_1 = ee.ImageCollection(img_1).mean().unmask(0);
// 2
var img_2 = ee.List([])
for (var i=year; i<year1; i++){
  var image2 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-2-1", i+"-2-28")
                              .map(cloudfree_landsat)
                              .mean());
  img_2 = img_2.add(image2);
}
img_2 = ee.ImageCollection(img_2).mean().unmask(0);
// 3
var img_3 = ee.List([])
for (var i=year; i<year1; i++){
  var image3 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-3-1", i+"-3-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_3 = img_3.add(image3);
}
img_3 = ee.ImageCollection(img_3).mean().unmask(0);
// 4
var img_4 = ee.List([])
for (var i=year; i<year1; i++){
  var image4 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-4-1", i+"-4-30")
                              .map(cloudfree_landsat)
                              .mean());
  img_4 = img_4.add(image4);
}
img_4 = ee.ImageCollection(img_4).mean().unmask(0);
// 5
var img_5 = ee.List([])
for (var i=year; i<year1; i++){
  var image5 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-5-1", i+"-5-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_5 = img_5.add(image5);
}
img_5 = ee.ImageCollection(img_5).mean().unmask(0);
// 6
var img_6 = ee.List([])
for (var i=year; i<year1; i++){
  var image6 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-6-1", i+"-6-30")
                              .map(cloudfree_landsat)
                              .mean());
  img_6 = img_6.add(image6);
}
img_6 = ee.ImageCollection(img_6).mean().unmask(0);
// 4
var img_7 = ee.List([])
for (var i=year; i<year1; i++){
  var image7 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-7-1", i+"-7-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_7 = img_7.add(image7);
}
img_7 = ee.ImageCollection(img_7).mean().unmask(0);
// 8
var img_8 = ee.List([])
for (var i=year; i<year1; i++){
  var image8 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-8-1", i+"-8-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_8 = img_8.add(image8);
}
img_8 = ee.ImageCollection(img_8).mean().unmask(0);
// 9
var img_9 = ee.List([])
for (var i=year; i<year1; i++){
  var image9 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-9-1", i+"-9-30")
                              .map(cloudfree_landsat)
                              .mean());
  img_9 = img_9.add(image9);
}
img_9 = ee.ImageCollection(img_9).mean().unmask(0);
// 10
var img_10 = ee.List([])
for (var i=year; i<year1; i++){
  var image10 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-10-1", i+"-10-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_10 = img_10.add(image10);
}
img_10 = ee.ImageCollection(img_10).mean().unmask(0);
// 11
var img_11 = ee.List([])
for (var i=year; i<year1; i++){
  var image11 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-11-1", i+"-11-30")
                              .map(cloudfree_landsat)
                              .mean());
  img_11 = img_11.add(image11);
}
img_11 = ee.ImageCollection(img_11).mean().unmask(0);
// 12
var img_12 = ee.List([])
for (var i=year; i<year1; i++){
  var image12 = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-11-1", i+"-12-31")
                              .map(cloudfree_landsat)
                              .mean());   
  img_12 = img_12.add(image12);
}
img_12 = ee.ImageCollection(img_12).mean().unmask(0);


// all
var img_all = ee.List([])
for (var i=year; i<year1; i++){
  var imageall = ee.Image(l8_col.filterBounds(roi)
                              .filterDate(i+"-1-1", i+"-12-31")
                              .map(cloudfree_landsat)
                              .mean());
  img_all = img_all.add(imageall);
}
img_all = ee.ImageCollection(img_all).mean().unmask(0);

var ndwi_1 = NDWI(img_1).rename('ndwi_1');
var mndwi_1 = MNDWI(img_1).rename('mndwi_1');
var ewi_1 = EWI(img_1).rename('ewi_1');
var ndbi_1 = NDBI(img_1).rename('ndbi_1');
var ndvi_1 = NDVI(img_1).rename('ndvi_1');
var savi_1 = SAVI(img_1).rename('savi_1');
var ndwi_2 = NDWI(img_2).rename('ndwi_2');
var mndwi_2 = MNDWI(img_2).rename('mndwi_2');
var ewi_2 = EWI(img_2).rename('ewi_2');
var ndbi_2 = NDBI(img_2).rename('ndbi_2');
var ndvi_2 = NDVI(img_2).rename('ndvi_2');
var savi_2 = SAVI(img_2).rename('savi_2');
var ndwi_3 = NDWI(img_3).rename('ndwi_3');
var mndwi_3 = MNDWI(img_3).rename('mndwi_3');
var ewi_3 = EWI(img_3).rename('ewi_3');
var ndbi_3 = NDBI(img_3).rename('ndbi_3');
var ndvi_3 = NDVI(img_3).rename('ndvi_3');
var savi_3 = SAVI(img_3).rename('savi_3');
var ndwi_4 = NDWI(img_4).rename('ndwi_4');
var mndwi_4 = MNDWI(img_4).rename('mndwi_4');
var ewi_4 = EWI(img_4).rename('ewi_4');
var ndbi_4 = NDBI(img_4).rename('ndbi_4');
var ndvi_4 = NDVI(img_4).rename('ndvi_4');
var savi_4 = SAVI(img_4).rename('savi_4');
var ndwi_5 = NDWI(img_5).rename('ndwi_5');
var mndwi_5 = MNDWI(img_5).rename('mndwi_5');
var ewi_5 = EWI(img_5).rename('ewi_5');
var ndbi_5 = NDBI(img_5).rename('ndbi_5');
var ndvi_5 = NDVI(img_5).rename('ndvi_5');
var savi_5 = SAVI(img_5).rename('savi_5');
var ndwi_6 = NDWI(img_6).rename('ndwi_6');
var mndwi_6 = MNDWI(img_6).rename('mndwi_6');
var ewi_6 = EWI(img_6).rename('ewi_6');
var ndbi_6 = NDBI(img_6).rename('ndbi_6');
var ndvi_6 = NDVI(img_6).rename('ndvi_6');
var savi_6 = SAVI(img_6).rename('savi_6');
var ndwi_7 = NDWI(img_7).rename('ndwi_7');
var mndwi_7 = MNDWI(img_7).rename('mndwi_7');
var ewi_7 = EWI(img_7).rename('ewi_7');
var ndbi_7 = NDBI(img_7).rename('ndbi_7');
var ndvi_7 = NDVI(img_7).rename('ndvi_7');
var savi_7 = SAVI(img_7).rename('savi_7');
var ndwi_8 = NDWI(img_8).rename('ndwi_8');
var mndwi_8 = MNDWI(img_8).rename('mndwi_8');
var ewi_8 = EWI(img_8).rename('ewi_8');
var ndbi_8 = NDBI(img_8).rename('ndbi_8');
var ndvi_8 = NDVI(img_8).rename('ndvi_8');
var savi_8 = SAVI(img_8).rename('savi_8');
var ndwi_9 = NDWI(img_9).rename('ndwi_9');
var mndwi_9 = MNDWI(img_9).rename('mndwi_9');
var ewi_9 = EWI(img_9).rename('ewi_9');
var ndbi_9 = NDBI(img_9).rename('ndbi_9');
var ndvi_9 = NDVI(img_9).rename('ndvi_9');
var savi_9 = SAVI(img_9).rename('savi_9');
var ndwi_10 = NDWI(img_10).rename('ndwi_10');
var mndwi_10 = MNDWI(img_10).rename('mndwi_10');
var ewi_10 = EWI(img_10).rename('ewi_10');
var ndbi_10 = NDBI(img_10).rename('ndbi_10');
var ndvi_10 = NDVI(img_10).rename('ndvi_10');
var savi_10 = SAVI(img_10).rename('savi_10');
var ndwi_11 = NDWI(img_11).rename('ndwi_11');
var mndwi_11 = MNDWI(img_11).rename('mndwi_11');
var ewi_11 = EWI(img_11).rename('ewi_11');
var ndbi_11 = NDBI(img_11).rename('ndbi_11');
var ndvi_11 = NDVI(img_11).rename('ndvi_11');
var savi_11 = SAVI(img_11).rename('savi_11');
var ndwi_12 = NDWI(img_12).rename('ndwi_12');
var mndwi_12 = MNDWI(img_12).rename('mndwi_12');
var ewi_12 = EWI(img_12).rename('ewi_12');
var ndbi_12 = NDBI(img_12).rename('ndbi_12');
var ndvi_12 = NDVI(img_12).rename('ndvi_12');
var savi_12 = SAVI(img_12).rename('savi_12');

var evi_1 = EVI(img_1).rename('evi_1');
var evi_2 = EVI(img_2).rename('evi_2');
var evi_3 = EVI(img_3).rename('evi_3');
var evi_4 = EVI(img_4).rename('evi_4');
var evi_5 = EVI(img_5).rename('evi_5');
var evi_6 = EVI(img_6).rename('evi_6');
var evi_7 = EVI(img_7).rename('evi_7');
var evi_8 = EVI(img_8).rename('evi_8');
var evi_9 = EVI(img_9).rename('evi_9');
var evi_10 = EVI(img_10).rename('evi_10');
var evi_11 = EVI(img_11).rename('evi_11');
var evi_12 = EVI(img_12).rename('evi_12');


var ndwi_all = NDWI(img_all).rename('ndwi_all');
var mndwi_all = MNDWI(img_all).rename('mndwi_all');
var ewi_all = EWI(img_all).rename('ewi_all');
var ndbi_all = NDBI(img_all).rename('ndbi_all');
var ndvi_all = NDVI(img_all).rename('ndvi_all');
var endisi = ENDISI(img_all).rename('endisi');
var bsi_all = BSI(img_all).rename('bsi_all');

var savi_all = SAVI(img_all).rename('savi_all');
var evj_all = EVI(img_all).rename('evj_all');
var lswi_all = LSWI(img_all).rename('lswi_all');
var ndti_all = NDTI(img_all).rename('ndti_all');
var ndsvi_all = NDSVI(img_all).rename('ndsvi_all');


var addNDVI = function(image) {
  var ndvi = image.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI');
  return image.addBands(ndvi);
};
var ndvicol = col.map(addNDVI).select('NDVI');

var ndvimax = ndvicol.reduce(ee.Reducer.max()).rename("ndvimax");
var ndvimin = ndvicol.reduce(ee.Reducer.min()).rename("ndvimin");
var ndvib = ndvimax.divide(ndvimin).rename("ndvib");

var coefficients = ee.Array([  
  [0.3561,0.3972,0.3904,0.6966,0.2286,0.1596],
  [-0.3344,-0.3544,-0.4556,0.6966,-0.0242,-0.263],
  [0.2626,0.2141,0.0926,0.0656,-0.7629,-0.5388]
]);  
  
var l8_array =  ee.ImageCollection('LANDSAT/LE07/C02/T1_L2')
  .filterDate(year+'-01-01',year+'-12-31')
  .filterBounds(roi)
  .map(cloudfree_landsat)
  .select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7']);  

var arrayImage1D = l8_array.mean().toArray();  
 
var arrayImage2D = arrayImage1D.toArray(1);  

// TCT  
var componentsImage = ee.Image(coefficients)   
                        .matrixMultiply(arrayImage2D)   
                        .arrayProject([0])   
                        .arrayFlatten([[  
                          'brightness', 'greenness', 'wetness' 
                        ]]); 

// glcm
var gray = l8_array.mean().clip(roi).expression(
      '(0.3 * NIR) + (0.59 * R) + (0.11 * G)', {
      'NIR': l8_array.mean().clip(roi).select('SR_B4'),
      'R': l8_array.mean().clip(roi).select('SR_B3'),
      'G': l8_array.mean().clip(roi).select('SR_B2'),
}).rename('gray');
var glcm = gray.unitScale(0,0.30).multiply(100).toInt().glcmTexture({size: 1,kernel:null});

var glcmb9 = ndvi_all.select('ndvi_all').clip(roi).multiply(10000).toInt().glcmTexture({size: 1,kernel:null});

// add bands into images
var image = img_1.addBands([
  ndwi_1, mndwi_1, evi_1, ndbi_1, ndvi_1, savi_1,
  ndwi_2, mndwi_2, evi_2, ndbi_2, ndvi_2, savi_2,
  ndwi_3, mndwi_3, evi_3, ndbi_3, ndvi_3, savi_3,
  ndwi_4, mndwi_4, evi_4, ndbi_4, ndvi_4, savi_4,
  ndwi_5, mndwi_5, evi_5, ndbi_5, ndvi_5, savi_5,
  ndwi_6, mndwi_6, evi_6, ndbi_6, ndvi_6, savi_6,
  ndwi_7, mndwi_7, evi_7, ndbi_7, ndvi_7, savi_7,
  ndwi_8, mndwi_8, evi_8, ndbi_8, ndvi_8, savi_8,
  ndwi_9, mndwi_9, evi_9, ndbi_9, ndvi_9, savi_9,
  ndwi_10, mndwi_10, evi_10, ndbi_10, ndvi_10,savi_10,
  ndwi_11, mndwi_11, evi_11, ndbi_11, ndvi_11,savi_11,
  ndwi_12, mndwi_12, evi_12, ndbi_12, ndvi_12,savi_12,
  ndwi_all, mndwi_all, ndbi_all, ndvi_all,
  endisi,bsi_all,savi_all,
  ndvib,ndvimax,ndvimin
])
.addBands(componentsImage).addBands(glcm)
.addBands(glcmb9)

// select bands
var bands = [
  'SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7',
  'ndwi_all', 'mndwi_all', 'ndbi_all', 'endisi','bsi_all', 'ndvib','ndvimax','ndvimin','savi_all',
  'ndwi_1', 'mndwi_1', 'ndbi_1', 'ndvi_1','savi_1','evi_1',
  'ndwi_2', 'mndwi_2', 'ndbi_2', 'ndvi_2','savi_2','evi_2',
  'ndwi_3', 'mndwi_3', 'ndbi_3', 'ndvi_3','savi_3','evi_3',
  'ndwi_4', 'mndwi_4', 'ndbi_4', 'ndvi_4','savi_4','evi_4',
  'ndwi_5', 'mndwi_5', 'ndbi_5', 'ndvi_5','savi_5','evi_5',
  'ndwi_6', 'mndwi_6', 'ndbi_6','ndvi_6','savi_6','evi_6',
  'ndwi_7', 'mndwi_7', 'ndbi_7','ndvi_7','savi_7','evi_7',
  'ndwi_8', 'mndwi_8', 'ndbi_8', 'ndvi_8','savi_8','evi_8',
  'ndwi_9', 'mndwi_9', 'ndbi_9', 'ndvi_9','savi_9','evi_9',
  'ndwi_10','mndwi_10', 'ndbi_10', 'ndvi_10','savi_10','evi_10',
  'ndwi_11','mndwi_11', 'ndbi_11', 'ndvi_11','savi_11','evi_11',
  'ndwi_12','mndwi_12', 'ndbi_12','ndvi_12','savi_12','evi_12',
  'brightness','greenness','wetness',
  'gray_ent','gray_var','gray_asm','gray_corr','gray_diss','gray_contrast','gray_savg',
];

var SP = ag.merge(fag)
var training = image.select(bands).sampleRegions({
  collection: SP,
  properties:['value'],
  scale: 30,
  tileScale:2
});
 

// set varified data
var withRandom = training.randomColumn('random');
var split = 0.8;
var trainingP = withRandom.filter(ee.Filter.lt('random', split)); // 70% training data
var testingP = withRandom.filter(ee.Filter.gte('random', split)); // 30% verified data


// //随机森林分类器
var classifier = ee.Classifier.smileRandomForest(200).train({
  features: trainingP,
  classProperty: 'value',
  inputProperties: bands
});

//****************************RF**************************//
var class_img = image.select(bands).classify(classifier);


// testing
var test = testingP.classify(classifier);
// overall accuracy,kappa
// confusion matrix
var confusionMatrix = test.errorMatrix('value', 'classification')
print('OA', confusionMatrix.accuracy());
print('kappa值', confusionMatrix.kappa());
print('ca', confusionMatrix.consumersAccuracy());
print('pa', confusionMatrix.producersAccuracy());
print('explain',classifier.explain());


// show images
var class_color = {
  min: 1,
  max: 10,
  palette: [
    'fae39c','446f33','33a02c',
    'abd37b','1e69b4','a6cee3',
    'cfbda3','e24290','289be8','ecece4'
  ]
};
Map.centerObject(roi, 7);

var class_img_mask_10 = class_img.select('classification').eq(10);
var img_mask_10 = class_img_mask_10.updateMask(class_img_mask_10);
Map.addLayer(img_mask_10.clip(roi.geometry()), class_color, 'colorizedVis111');
// print(img_mask_10);
// Map.addLayer(table, '', 'table');
Export.image.toDrive({
  image: img_mask_10.clip(roi.geometry()),
  description: 'l7v3guangdongdp'+year,//name.getInfo(),
  crs: "EPSG:4326",
  scale: 30,
  region: roi.geometry(),
  maxPixels: 1e13,
  folder: 'DP'
});
