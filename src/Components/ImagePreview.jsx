import React from 'react'
import placeholder from '../assets/placeholder.png'

const ImagePreview = ({ source }) => {
  return (
    <div className="image-preview-wrapper">
      <img src={source || placeholder} alt="" className="image-preview" />
    </div>
  )
}

export default ImagePreview