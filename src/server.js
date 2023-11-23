/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import { resolve } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express()
dotenv.config()

const port = process.env.PORT || 3000;
const {DB_URI} = process.env;

app.use(cors());
app.options('*', cors());



connect(DB_URI)
  .then(() => console.log('Connected!'))
  .catch((error) => console.error(error))


const AutosSchema = new Schema({
    Title: {type: String},
    Mileage: {type: Number},
    Engine: {type: String},
    Exterior_color: {type: String},
    Interior_color: {type: String},
    Vin: {type: String},
    Description: {type: String},
    Price: {type: Number},
    Image: {type: String}
})

const Autos = model('Autos', AutosSchema)

app.use(json())

app.get('/inventory/', async (req, res) => {
    try {
      console.log('Server: Handling GET request to /inventory/');
      const allCars = await Autos.find({})
      console.log('Server: Successfully retrieved data');
      res.status(200).json({ message: 'Found inventory', data: allCars });
   }
   catch(error) {
      console.error('Error Retrieving Data :', error)
		  res.status(500).send({error: 'Internal Server Error'})
   }
})


app.post('/post', async(req, res) => {
  try{
    const {Title, Mileage, Engine, Exterior_color, Interior_color, Vin, Description, Price, Image} = req.body
    const foundCar = await Autos.findOne({Vin})

    if(!foundCar){
      const newAutos = new Autos({
        Title,
        Mileage,
        Engine,
        Exterior_color,
        Interior_color,
        Vin,
        Description,
        Price,
        Image
      })
      const savedAutos = await newAutos.save();
      res.status(201).send({ message: 'Car successfully posted', data: savedAutos });
    }
    else {
      res.send('Car already posted')
    }
  }
  catch(error) {
			console.error('Error Posting Data :', error)
			res.status(500).send({error: 'Internal Server Error'})   
  }
})

app.delete('/delete/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const deletedCar = await Autos.deleteOne({ _id: id });
        res.status(200).send({ message: 'Vehicle Deleted' });
    } catch (error) {
        console.error('Error Deleting Data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/inventory/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const carData = await Autos.findById(id);
        res.status(200).json({ message: 'Here is your vehicle', data: carData });
    } catch (error) {
        console.error('Error Retrieving Car Data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.put('/edit/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const updatedCar = await Autos.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: 'Car successfully updated', data: updatedCar });
    } catch (error) {
        console.error('Error Updating Car:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



app.listen(port, () => {console.log(`Server is connected on ${port}`)})