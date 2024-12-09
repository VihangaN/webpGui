import { useEffect, useState, useRef, useCallback } from 'react'
import './styles/app.scss'
import DropZone from './Components/DropZone.jsx'
import ImagePreview from './Components/ImagePreview.jsx'
import {
  Progress,
  Slider,
  Checkbox,
  Spin,
  notification
} from 'antd'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { invoke, convertFileSrc } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import { load } from '@tauri-apps/plugin-store'
import { LoadingOutlined } from '@ant-design/icons'

function App () {
  const dropZoneRef = useRef(null)
  const [imgUrl, setImgUrl] = useState('')
  const [outputDir, setOutputDir] = useState(null)
  const [inputFile, setInputFile] = useState('')
  const [progress, setProgress] = useState(0)
  const [messageInfo, setMessage] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const imgRef = useRef(null)
  const [convertedFile, setConvertedFile] = useState(null)
  const [options, setOptions] = useState({
    q: 75,
    lossless: false,
  })
  const [api, contextHolder] = notification.useNotification()

  const openNotification = (title,content) => {
    api.info({
      message: title,
      key:title,
      description:content,
      placement:'bottomRight'
    })
  }
  // tauri store
  let store;
  (async () => {
    store = await load('store.json', { autoSave: false })
  })()

  // function to show preview image
  const handleShowImage = (imagePath) => {
    if (imagePath) {
      const displayImage = convertFileSrc(imagePath)
      setImgUrl(displayImage)
      setInputFile(imagePath)
      // Reset previous conversion states
      setConvertedFile(null)
      setMessage('')
      setProgress(0)
    }
  }

  // file conversion
  const handleFileConversion = useCallback(async () => {
    if (!inputFile) {
      setMessage('Please select an image to convert')
      return
    }

    setProgress(0)
    setMessage('')
    setIsConverting(true)

    const { value } = await store.get('output-dir')
    const outPutDirectory = value

    try {
      const inputFileName = inputFile.split('/').pop() // Extract the file name from the path
      const fileNameWithoutExt = inputFileName.substring(0, inputFileName.lastIndexOf('.'))
      const outputPath = outPutDirectory
        ? `${outPutDirectory}/${fileNameWithoutExt}.webp`
        : `${inputFile.substring(0, inputFile.lastIndexOf('.'))}.webp`

      const unlisteners = []

      const progressUnlisten = await listen('convert-progress', (event) => {
        const progressValue = Number(event.payload)
        if (!isNaN(progressValue)) {
          setProgress(progressValue)
        }
      })
      unlisteners.push(progressUnlisten)

      const completeUnlisten = await listen('convert-complete', (event) => {
        setMessage(event.payload || 'Conversion complete!')
        setConvertedFile(outputPath)
        setProgress(100)
        setIsConverting(false)
        unlisteners.forEach((unlisten) => unlisten())
      })
      unlisteners.push(completeUnlisten)

      const errorUnlisten = await listen('convert-error', (event) => {
        setMessage(event.payload || 'Conversion failed')
        setIsConverting(false)
        unlisteners.forEach((unlisten) => unlisten())
      })
      unlisteners.push(errorUnlisten)

      await invoke('convert_to_webp_with_progress', {
        inputPath: inputFile,
        outputPath,
        quality: options.q,
        lossless: options.lossless,
        resize: options.resize,
      })
    } catch (error) {
      console.error('Conversion failed:', error)
      setMessage(`Error: ${error instanceof Error ? error.message : 'Conversion failed'}`)
      setIsConverting(false)
    }
  }, [inputFile, options, outputDir])

  // dnd logic
  useEffect(() => {
    const supportedFileTypes = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp']

    const getFileExtension = (filename) => {
      return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
    }

    const registerDragDropEvents = async () => {
      const webview = await getCurrentWebview()
      const unlisten = await webview.onDragDropEvent(async (event) => {
        if (event.payload.type === 'over' && event.payload.type !== 'drop') {
          dropZoneRef.current.highlight()
        }
        if (event.payload.type === 'drop') {
          dropZoneRef.current.reset()
          const files = event.payload.paths

          if (files.length > 0) {
            const file = files[0]
            const fileExtension = '.' + getFileExtension(file)

            if (supportedFileTypes.includes(fileExtension)) {
              handleShowImage(file)
            } else {
              openNotification('error', <>
                Unsupported file type: {fileExtension} <br /><br />
                Use one of the following image formats <br /> <strong>.jpg, .jpeg, .png, .webp, .tiff, or .bmp</strong>
              </>)

            }
          }
        }
      })

      return unlisten
    }

    let unlisten = null
    registerDragDropEvents().then((result) => (unlisten = result))

    return () => {
      if (unlisten) unlisten()
    }
  }, [])

  // handle output dir
  const handleOutputDir = async () => {
    try {
      const directory = await open({
        multiple: false,
        directory: true,
      })

      if (directory) {
        await store.set('output-dir', { value: directory })
        store.save()
      } else {
        console.log('No directory was selected.')
      }
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  }

  // reset

  const handleReset = () => {
    setConvertedFile(null)
    setInputFile('')
    setProgress(0)
    setMessage('')
    setImgUrl('')
    if (imgRef.current) {
      imgRef.current.src = ''
    }
  }

  // Update conversion options
  const onChangeOptions = (key, value) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }))
  }

  // disable context menu
  document.addEventListener('contextmenu', event => event.preventDefault());

  return (
    <>
      {contextHolder}
      <main className="container">
        <div className="left">
          <div className="drop-zone-base">
            <DropZone ref={dropZoneRef} converting={isConverting} />
          </div>

        </div>
        <div className="right">
          <div className="preview">
            <ImagePreview source={imgUrl} />
            <Progress
              className="progress-bar"
              percent={progress}
              status="active"
              showInfo={false}
              strokeColor={{
                from: '#108ee9',
                to: '#87d068',
              }}
            />
          </div>
          <div className="image-options">
            <div className="options-title">Options</div>
            <div className="options">
              <div className="title">Output directory</div>
              <div className="content">
                <button className="btn" onClick={handleOutputDir}>...</button>
              </div>
            </div>
            <div className="options">
              <div className="title">Quality</div>
              <div className="content">
                <Slider
                  min={0}
                  max={100}
                  value={options.q}
                  className="slider"
                  tooltip={{ formatter: (val) => `${val}%` }}
                  onChange={(value) => onChangeOptions('q', value)}
                />
                {options.q}%
              </div>
            </div>
            <div className="options">
              <div className="title">Loseless</div>
              <div className="content">
                <Checkbox checked={options.lossless}
                          onChange={({ target }) => onChangeOptions('lossless', target.checked)} />
              </div>
            </div>
          </div>
          <div className={`convert-wrapper ${isConverting ? 'converting' : ''}`}>
            {isConverting && <Spin style={{ color: '#1D92E1' }}
                                   className="spin-wrapper"
                                   indicator={<LoadingOutlined spin
                                   />}
                                   size="large" />}

            <>
              {convertedFile ? <button className="btn convert" onClick={handleReset}>Convert Another</button> : <button
                title={!inputFile ? 'Please add an image first' : ''}
                className="btn convert" onClick={handleFileConversion}
                disabled={!inputFile || isConverting}>Convert
              </button>}
            </>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
