const Campground = require("../models/Campground");




exports.getCampgrounds = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    query = Campground.find(JSON.parse(queryStr)).populate('bookings');


    //Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('name');
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Campground.countDocuments();

    query = query.skip(startIndex).limit(limit);


    const campground = await query;

    // Pagenation result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }

    console.log(campground);

    res.status(200).json({ success: true, data: campground, count: campground.length, pagination });
  } catch (err) {
    console.log(err.stack)
    res.status(400).json({ success: false });
  }
};

exports.getCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.createCampground = async (req, res, next) => {
  const campground = await Campground.create(req.body);
  res.status(201).json({ success: true, data: campground });
};

exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: campground });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    await campground.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
