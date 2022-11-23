import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App'
import './global.less'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6C4AB6',
          colorError: '#DC3535',
          colorSuccess: '#54B435',
          colorInfo: '#8D9EFF',
          colorWarning: '#F49D1A'
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
