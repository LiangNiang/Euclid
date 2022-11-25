import { Button, Space, Tag } from 'antd'

function App() {
  return (
    <>
      <h1>Hello World</h1>
      <Space>
        <Tag color="success">success</Tag>
        <Tag color="processing">processing</Tag>
        <Tag color="error">error</Tag>
        <Tag color="warning">warning</Tag>
        <Tag color="default">default</Tag>
      </Space>
      <Space>
        <Button danger>Danger</Button>
        <Button type="primary">Primary</Button>
      </Space>
    </>
  )
}

export default App
