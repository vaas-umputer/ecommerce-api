const mongoose=require('mongoose')

const productSchema=mongoose.Schema({
        name:{
            type:String,
            required:true,
        },
        image:{
            type:String,
            required:false,
            default:''
        },
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category',
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        countInStock:{
            type:Number,
            required:true
        }
    },
{
    timestamps:true
}
)

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals:true,
});

const Product=mongoose.model('Product',productSchema);
module.exports=Product;