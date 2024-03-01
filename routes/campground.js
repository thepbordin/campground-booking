/**
* @swagger
* tags:
*   name: Campgrounds
*   description: The campground managing API
*/

/**
 * @swagger
 * components:
 *  schemas:
 *    Campground:
 *      type: object
 *      required:
 *        - name
 *        - address
 *      properties:
 *        id:
 *          type: string
 *          format: uuid
 *          description: The auto-generated id of the campground
 *          example: d290f1ee-6c54-4b01-90e6-d701748f0851

 *        name:
 *          type: string
 *          description: Campground name
 *        address:
 *          type: string
 *          description: House No., Street, Road
 *        district:
 *          type: string
 *          description: District
 *        province:
 *          type: string
 *          description: province
 *        postalcode:
 *          type: string
 *          description: 5-digit postal code
 *        tel:
 *          type: string
 *          description: telephone number
 *        region:
 *          type: string
 *          description: region
 *      example:
 *        id: 609bda561452242d88d36e37
 *        name: Happy Campground
 *        address: 121 ถ.สุขุมวิท
 *        district: บางนา
 *        province: กรุงเทพมหานคร
 *        postalcode: 10110
 *        tel: 02-2187000
 *        region: กรุงเทพมหานคร (Bangkok)
 */


/**
* @swagger
* /campground:
*   get:
*     summary: Returns the list of all the campground
*     tags: [Campgrounds]
*     responses:
*       200:
*         description: The list of the campground
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                   $ref: '#/components/schemas/Campground'
*/
/**
* @swagger
* /campground/{id}:
*   get:
*     summary: Get the campground by id
*     tags: [Campgrounds]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The campground id
*     responses:
*       200:
*         description: The campground description by id
*         contents:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Campground'
*       404:
*         description: The campground was not found
*/


/**
* @swagger
* /campground:
*   post:
*     summary: Create a new campground
*     tags: [Campgrounds]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Campground'
*       responses:
*         201:
*           description: The campground was successfully created
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Campground'
*         500:
*           description: Some server error
*/
/**
* @swagger
* /campground/{id}:
*   put:
*     summary: Update the campground by the id
*     tags: [Campgrounds]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The campground id
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Campground'
*       responses:
*         200:
*           description: The campground was updated
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/Campground'
*         404:
*           description: The campground was not found
*         500:
*           description: Some error happened
*/

/**
* @swagger
* /campground/{id}:
*   delete:
*     summary: Remove the campground by id
*     tags: [Campgrounds]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The campground id
*
*     responses:
*       200:
*         description: The campground was deleted
*       404:
*         description: The campground was not found
*/
const express = require("express");
const {
  getCampgrounds,
  getCampground,
  createCampground,
  updateCampground,
  deleteCampground,
} = require("../controllers/campground");
// Include other resource routers
const bookingRouter = require("./booking");

const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.use("/:campgroundId/bookings", bookingRouter);

router.route("/").get(getCampgrounds).post(protect, authorize('admin'), createCampground);
router
  .route("/:id")
  .get(getCampground)
  .put(protect, authorize('admin'), updateCampground)
  .delete(protect, authorize('admin'), deleteCampground);


module.exports = router;
