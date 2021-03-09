'use strict';
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3003;

//client.on("error", (error) => console.log(error));

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', renderHomepage);
//app.post("/cities", addCity);
app.post('/cities', getCity);
// app.delete("/cities/:id", deleteCity);

function renderHomepage(req, res) {
  // gets top rated cities
  // takes in search for a new city
  // renders homepage
  res.render('pages/index.ejs');
}

function addCity(req, res) {
  // add city to favorites
  // redirect to favorites page
}

function getCity(req, res) {
  const cityname = req.body.city_name.toLowerCase();
  //console.log(req.body);
  let newCity = new City(null, cityname);
  const url = `https://api.teleport.org/api/urban_areas/slug:${cityname}/scores`;
  const agentArray = [superagent.get(url), superagent.get(`https://api.teleport.org/api/urban_areas/slug:${cityname}/images`)];
  Promise.all(agentArray).then(responseArray =>{
    const cityResults = responseArray[0];
    const imageResult = responseArray[1];
    newCity.description = cityResults.body.summary.replace(/<[^>]*>/g, '');
    newCity.housing = cityResults.body.categories[0].score_out_of_10.toFixed(2);
    newCity.cost_of_living = cityResults.body.categories[1].score_out_of_10.toFixed(2);
    newCity.startup = cityResults.body.categories[2].score_out_of_10.toFixed(2);
    newCity.venture_capital = cityResults.body.categories[3].score_out_of_10.toFixed(2);
    newCity.travel_connect = cityResults.body.categories[4].score_out_of_10.toFixed(2);
    newCity.commute = cityResults.body.categories[5].score_out_of_10.toFixed(2);
    newCity.buisness = cityResults.body.categories[6].score_out_of_10.toFixed(2);
    newCity.safety = cityResults.body.categories[7].score_out_of_10.toFixed(2);
    newCity.healthcare = cityResults.body.categories[8].score_out_of_10.toFixed(2);
    newCity.education = cityResults.body.categories[9].score_out_of_10.toFixed(2);
    newCity.enviroment = cityResults.body.categories[10].score_out_of_10.toFixed(2);
    newCity.economy= cityResults.body.categories[11].score_out_of_10.toFixed(2);
    newCity.taxation = cityResults.body.categories[12].score_out_of_10.toFixed(2);
    newCity.internet_access = cityResults.body.categories[13].score_out_of_10.toFixed(2);
    newCity.culture = cityResults.body.categories[14].score_out_of_10.toFixed(2);
    newCity.tolerance = cityResults.body.categories[15].score_out_of_10.toFixed(2);
    newCity.outdoors = cityResults.body.categories[16].score_out_of_10.toFixed(2);
    newCity.generalScore = cityResults.body.teleport_city_score.toFixed(2);
    newCity.image_url = imageResult.body.photos[0].image.mobile;

    console.log(newCity);
    res.render('pages/details.ejs', { newCity: newCity });
  })
    .catch(error => {
      console.log(error);
      res.status(500).send(`Sorry something went wrong`);
    });
}


function deleteCity(res, req) {
  //delete city from favorites
  // direct to favorites page
}

function City(cityData, cityName) {
  this.name = cityName;
  this.description = null;
  this.housing = null;
  this.cost_of_living = null;
  this.startup = null;
  this.image_url = null;
  // this.happyness = this.
  //this.scores = cityData.scores;
  //this.transportdata = transportdata
}

app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`))