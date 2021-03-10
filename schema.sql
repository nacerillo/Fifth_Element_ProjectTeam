DROP TABLE IF EXISTS city_data;

CREATE TABLE city_data(
id SERIAL PRIMARY KEY, 
name VARCHAR(255),
summary VARCHAR(255),
housing FLOAT(30),
cost_of_living FLOAT(30),
startup FLOAT(30),
venture_capital FLOAT(30),
travel_connect FLOAT(30),
commute FLOAT(30),
buisness FLOAT(30),
safety FLOAT(30),
healthcare FLOAT(30),
education FLOAT(30),
enviroment FLOAT(30),
economy FLOAT(30),
taxation FLOAT(30),
internet_access FLOAT(30),
culture FLOAT(30),
tolerance FLOAT(30),
outdoors FLOAT(30), 
generalScore FLOAT(30),
image_url VARCHAR(500)
);