import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider, theme } from 'antd'

const themeConfig = {
  "token": {
    "colorPrimary": "#2f2f2f",
    "colorInfo": "#2f2f2f",
    "wireframe": false
  },
  "components": {
    "Button": {
      "defaultBg": "rgb(255,255,255)"
    },
    "Card": {
      "actionsBg": "rgb(0,0,0)",
      "colorBgContainer": "rgb(47,47,47)",
      "colorPrimary": "rgb(149,165,166)",
      "colorTextHeading": "rgb(149,165,166)",
      "colorTextDescription": "rgba(234,229,229,0.45)",
      "colorText": "rgb(149,165,166)",
      "colorBorderSecondary": "rgb(149,165,166)",
      "algorithm": true
    },
    "Checkbox": {
      "colorPrimary": "rgb(37,37,37)",
      "colorPrimaryHover": "rgb(37,37,37)",
      "colorBorder": "rgb(149,165,166)",
      "colorBgContainer": "rgb(37,37,37)",
      "colorPrimaryBorder": "rgb(149,165,166)"
    },
    "Input": {
      "colorBgContainer": "rgb(58,58,58)",
      "colorText": "rgb(149,165,166)",
      "colorTextDescription": "rgb(149,165,166)",
      "colorTextPlaceholder": "rgb(149,165,166)",
      "colorPrimaryActive": "rgb(58,58,58)",
      "activeBorderColor": "rgb(58,58,58)",
      "hoverBorderColor": "rgb(58,58,58)",
      "colorBorder": "rgb(58,58,58)"
    },
    "Slider": {
      "railBg": "rgb(37,37,37)",
      "trackBg": "rgb(149,165,166)",
      "railHoverBg": "rgb(37,37,37)",
      "trackHoverBg": "rgb(149,165,166)",
      "handleColor": "rgb(149,165,166)",
      "handleActiveColor": "rgb(149,165,166)"
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={themeConfig}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
