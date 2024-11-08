import { Box, Button, Card, TextField} from "@mui/material"
import { useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import courseState  from "../recoil/atom/courseAtom.js"
import axios from "axios"
import DeleteCourse from "./DeleteCourse.jsx"
import PropTypes from 'prop-types';
import toast from 'react-hot-toast'

// import { useParams } from "react-router-dom"

function UpdateCourse({courseId}){

    const setCourse = useSetRecoilState(courseState)
    const course = useRecoilValue(courseState)
    const [title , setTitle] = useState(course.title)
    const [description, setDescription] = useState(course.description)
    const [price, setPrice] = useState(course.price)
    const [image, setImage] = useState(course.imageLink)
    const [file, setFile] = useState()

    const handleSubmit = async(e)=>{
        e.preventDefault()
        
        const formData = new FormData()

        formData.append('image', file)
        formData.append('title', title)
        formData.append('description', description)
        formData.append('price', price)
        formData.append('published', true)
        formData.append('imageLink', image)

        const {data} = await axios.put('http://localhost:3000/admin/course/' + courseId, formData, {
            headers: {
                "Content-Type" : "multipart/form-data",
                "Authorization" : "Bearer "+localStorage.getItem('token')
            }
        })

        if (data.success){
            setCourse({
                title : title,
                description : description,
                imageLink : image
            })
            toast.success('Course Updated Successfully')

        }
}

    return <Card
    variant="outlined"
    style={{
        width : "400px",
        padding : "20px",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" 
    }}
    >
        <Box component={'form'} noValidate onSubmit={handleSubmit}>
        <TextField
        variant="outlined"
        fullWidth = {true}
        onChange={(e)=>{
            setTitle(e.target.value)
        }}
        label = "Title"
        value={title}
        >
        </TextField>
        
        <br /> <br />            
        
        <TextField
        variant="outlined"
        fullWidth = {true}
        onChange={(e)=>{
            setDescription(e.target.value)
        }}
        label = "Description"
        value = {description}
        >
        </TextField>
        
        <br /><br />

        
        <TextField
        variant="outlined"
        fullWidth = {true}
        onChange={(e)=>{
            setPrice(e.target.value)
        }}
        label = "Price"
        value = {price}
        >
        </TextField>
        
        <br /><br />

        <input type="file" name="image" id="image" accept="image/*" onChange={(e) => {
                setFile(e.target.files[0])
        }} />


        {/* <TextField
        variant="outlined"
        fullWidth = {true}
        onChange={(e)=>{
            setImage(e.target.value)
        }}
        label = "Image Link"
        value = {image}
        >
        </TextField> */}

        <br /><br />
        
        <Button
        type="submit"
        variant="contained"
        size = "large"
        // onClick={}
        >Update</Button>
        </Box>
        <DeleteCourse />
    </Card>

}

UpdateCourse.propTypes = {
    courseId: PropTypes.string.isRequired
}


export default UpdateCourse
