import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: true,
})

export default withNextra({
  output: 'export',
  images: { unoptimized: true },
  basePath: '/formosaic',
  trailingSlash: true,
})
