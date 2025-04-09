const express = require('express');
const router = express.Router();
const Settings  =  require('./model/setting.js')
const { v4: uuidv4 } = require('uuid');





router.route('/create_setting').post(async (req, res) => {
  const {  round, game,note,   } = req.body;
  try {
    const newSettings= new Settings({
      id: uuidv4(), // Generate a unique ID
      round,
      game,
      note,
      // createAt,
      // updateAt,
    });
    await newSettings.save();
    res.status(201).json(newSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error creating newSetting', error });
  }
});

//ALL TIME
router.route('/list_setting').get(async (req, res) => {
  try {
    const allSettings  = await Settings.find();  // Fetch all records from the collection
    res.status(200).json(allSettings );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching setting', error });
  }
});


router.route('/update_setting').put(async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ message: 'ID is required in the request body.' });
    }
    const updateSettings = await Settings.findOneAndUpdate({ id }, updateData, { new: true });

    if (!updateSettings) {
      return res.status(404).json({ message: `Setting with id "${id}" not found.` });
    }
    res.json(updateSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Setting', error });
  }
});


router.route('/delete_setting/:id').delete(async (req, res) => {
  try {
    const deletedTime = await Settings.findOneAndDelete({ id: req.params.id });

    if (!deletedTime) {
      return res.status(404).json({ message: `Setting with id "${req.params.id}" not found` });
    }

    res.status(200).json({ message: `Setting with id "${req.params.id}" was successfully deleted.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting time', error });
  }
});




// //export router for use
module.exports = router;
