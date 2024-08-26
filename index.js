//try connecting stripe for payment
const express=require('express')
const mongoose=require('mongoose')
const Product=require('./models/product.js')
const Category=require('./models/category.js')
const productRoute=require('./routes/product.route.js')
const User=require('./models/user.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authJwt=require('./authJwt.js');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');
require('dotenv').config();


const app=express()

//middleware
app.use(express.json());
app.use(authJwt());


//router
app.use('/api/products',productRoute);

mongoose.connect("mongodb+srv://vaasini04:Vaasi_leo%4004@api-dev.mh0wvnv.mongodb.net/Node-api?retryWrites=true&w=majority&appName=api-dev")
.then(()=>{
    console.log("Connected to database");
    app.listen(3000,()=>{
        console.log("server is running on port 3000")
    })
})
.catch(()=>{
    console.log("connection failed");
})

app.get('/',(req,res)=>{
    res.send('Hello server');
});


app.post('/api/category',async (req,res)=>{
    try{
        const category = await Category.create(req.body);
        res.status(200).json(category);
    }catch(error){
        res.status(500).json({message:error.message});
    }
})

app.post('/api/user/register',async(req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save();

    if(!user){
        return res.status(404).json({message:"User can't be created"})
    }

    res.send(user);
})

app.delete('/api/user/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'User deleted successfully' })
        } else {
            return res.status(404).json({ success: false, message: 'User cannot find' })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})


/*app.post('/api/user/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email})
    const secret = process.env.SECRET;

    if(!user) {
        return res.status(400).send('User with given Email not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userID: user.id,
            isAdmin : user.isAdmin
        }, secret, {expiresIn : '1d'} )
        res.status(200).send({user: user.email, token: token});
    } else {
        res.status(400).send('Password mismatch');
    }

    return res.status(200).send(user);
})*/

app.post('/api/user/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const secret = process.env.SECRET;

        if (!user) {
            return res.status(400).send('User with given Email not found');
        }

        if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
            const token = jwt.sign(
                {
                    userID: user.id,
                    isAdmin: user.isAdmin
                },
                secret,
                { expiresIn: '1d' }
            );
            return res.status(200).send({ user: user.email, token: token });
        } else {
            return res.status(400).send('Password mismatch');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/api/user', async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success:false})
    }
    res.send(userList);
})


// orders
// View all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user')
            .populate('orderItems');
        res.send(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
    }
});

// View a specific order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('orderItems');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.send(order);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve order' });
    }
});

// Place a new order
app.post('/api/orders', async (req, res) => {
    try {
        const orderItemIds = [];
        const errors = [];

        // Validate and create order items
        for (const item of req.body.orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                errors.push(`Product with ID ${item.product} does not exist.`);
                continue;
            }
            if (product.stock < item.quantity) {
                errors.push(`Insufficient stock for product with ID ${item.product}.`);
                continue;
            }

            const orderItem = new OrderItem({
                quantity: item.quantity,
                product: item.product
            });
            const savedOrderItem = await orderItem.save();
            orderItemIds.push(savedOrderItem._id);
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Calculate total price
        let totalPrice = 0;
        for (const id of orderItemIds) {
            const orderItem = await OrderItem.findById(id).populate('product');
            totalPrice += orderItem.product.price * orderItem.quantity;
        }

        // Create and save the order
        const order = new Order({
            orderItems: orderItemIds,
            area: req.body.area,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        const savedOrder = await order.save();
        res.send(savedOrder);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
});












