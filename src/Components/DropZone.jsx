import React, { forwardRef, useImperativeHandle, useRef } from 'react'

const DropZone = forwardRef((props, ref) => {
  const divRef = useRef()
  const { converting } = props
  useImperativeHandle(ref, () => ({
    highlight () {
      if (divRef.current) {
        divRef.current.style.border = '1px dashed #1D92E1'
      }
    },
    reset () {
      if (divRef.current) {
        divRef.current.style.border = '1px dashed #95a5a6'
      }
    },
  }))

  return (
    <div ref={divRef} className="drop-zone-wrapper">
      {!converting ? 'Drop image file here' : 'Converting ...'}
    </div>
  )
})

export default DropZone
