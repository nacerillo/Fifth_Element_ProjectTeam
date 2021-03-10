'use strict';
require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const client = new pg.Client(process.env.DATABASE_URL);
const app = express();
const PORT = process.env.PORT || 3003;
const JOB_API = process.env.JOB_API;
const JOB_ID = process.env.JOB_ID;

client.on('error', (error) => console.log(error));

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', renderHomepage);
app.post('/search/result', getCity);
app.post('/search/job', getJob);
app.get('/favorites', renderFavPage);
app.post('/favorites', addToFavorites);


function renderHomepage(req, res) {
  res.render('pages/index.ejs');
}

function getCity(req, res) {
  const cityname = req.body.city_name.replace(/\s+/g, '-').toLowerCase();
  const checkData = `SELECT * FROM city_data WHERE name = $1`;
  const checkArray = [cityname];
  // console.log(cityname, 'city-name');
  client.query(checkData, checkArray).then((returnedData) => {
    if (returnedData.rowCount === 0) {
      let newCity = new City(null, cityname);
      const url_1 = `https://api.teleport.org/api/urban_areas/slug:${cityname}/scores`;
      const url_2 = `https://api.teleport.org/api/urban_areas/slug:${cityname}/images`;
      const agentArray = [superagent.get(url_1), superagent.get(url_2)];
      Promise.all(agentArray)
        .then((responseArray) => {
          const cityResults = responseArray[0];
          const imageResult = responseArray[1];
          newCity.description = cityResults.body.summary.replace(/<[^>]*>/g,'');
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
          newCity.economy = cityResults.body.categories[11].score_out_of_10.toFixed(2);
          newCity.taxation = cityResults.body.categories[12].score_out_of_10.toFixed(2);
          newCity.internet_access = cityResults.body.categories[13].score_out_of_10.toFixed(2);
          newCity.culture = cityResults.body.categories[14].score_out_of_10.toFixed(2);
          newCity.tolerance = cityResults.body.categories[15].score_out_of_10.toFixed(2);
          newCity.outdoors = cityResults.body.categories[16].score_out_of_10.toFixed(2);
          newCity.generalScore = cityResults.body.teleport_city_score.toFixed(2);
          newCity.image_url = imageResult.body.photos[0].image.mobile;


          const addData = `INSERT INTO city_data (name,description,housing,cost_of_living,startup,venture_capital,travel_connect, 
            commute, buisness,safety,healthcare,education,enviroment,economy,taxation,internet_access,culture,tolerance,outdoors,generalScore,image_url) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`;
          const addArray = [
            newCity.name,
            newCity.description,
            newCity.housing,
            newCity.cost_of_living,
            newCity.startup,
            newCity.venture_capital,
            newCity.travel_connect,
            newCity.commute,
            newCity.buisness,
            newCity.safety,
            newCity.healthcare,
            newCity.education,
            newCity.enviroment,
            newCity.economy,
            newCity.taxation,
            newCity.internet_access,
            newCity.culture,
            newCity.tolerance,
            newCity.outdoors,
            newCity.generalScore,
            newCity.image_url,
          ];
          client.query(addData, addArray).catch((error) => {
            console.log(error);
            res
              .status(500)
              .send('Looks like there\'s a problem with adding data.');
          });
          res.render('pages/details.ejs', { newCity: newCity });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send(`Sorry something went wrong`);
        });
    } else {
      console.log('Already Exists');
      res.render('pages/details.ejs', { newCity: returnedData.rows[0] });
    }
  });
}

function getJob(req, res){
  const cityname = req.body.city_name;
  let userInput = req.body.job_query
  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${JOB_ID}&app_key=${JOB_API}&results_per_page=5&what_or=${userInput}&where=${cityname}&salary_min=40000&content-type=application/json`;
  superagent.get(url)
    .then(result => {
      const output = result.body.results.map(job => new Job(job))
      res.render('pages/job', {output})
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(`Sorry something went wrong`);
    });
}

function renderFavPage(req, res){
  const sqlString = 'SELECT * FROM city_fav_data;';
  client.query(sqlString)
    .then(result => {
      const ejsObject = {allCities: result.rows};
      res.render('pages/favorites.ejs', ejsObject);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(`Sorry something went wrong`);
    });
}

function addToFavorites(req, res){
  const sqlString = `INSERT INTO city_fav_data (name,description,housing,cost_of_living,startup,venture_capital,travel_connect, 
    commute, buisness, safety, healthcare, education, enviroment, economy, taxation, internet_access, culture, tolerance, outdoors,generalScore, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING id;`;
  const sqlArray = [
    req.body.name,
    req.body.description,
    req.body.housing,
    req.body.cost_of_living,
    req.body.startup,
    req.body.venture_capital,
    req.body.travel_connect,
    req.body.commute,
    req.body.buisness,
    req.body.safety,
    req.body.healthcare,
    req.body.education,
    req.body.enviroment,
    req.body.economy,
    req.body.taxation,
    req.body.internet_access,
    req.body.culture,
    req.body.tolerance,
    req.body.outdoors,
    req.body.generalScore,
    req.body.image_url];
    // console.log(sqlArray)
  client.query(sqlString, sqlArray)
    .then(() => {
      console.log('added to DB');
      res.redirect(`/favorites`);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(`Sorry something went wrong`);
    });
}

function Job(object){
  this.title = object.title.replace(/<[^>]*>/g,'');
  this.company = object.company.display_name;
  this.location = object.location.display_name;
  this.job_link = object.redirect_url;
  this.salary_min = object.salary_min;
  this.salary_max = object.salary_max;
}

function City(cityData, cityName) {
  this.name = cityName;
  // this.description = null;
  // this.housing = null;
  // this.cost_of_living = null;
  // this.startup = null;
  // this.image_url = null;
}
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`app is up on port http://localhost:${PORT}`);
  });
});
