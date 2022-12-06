#!/usr/bin/env node
import { program, Option } from 'commander'
import Ajv from 'ajv'
import { readFile } from 'node:fs'
import { resolve } from 'node:path'
import Core from '@euclid/core'

const ajv = new Ajv()

function validateConfigFile(
  data: unknown
): data is { project: Project.InputParam; user?: User.InputParam } {
  const schema = {
    type: 'object',
    properties: {
      project: {
        type: 'object',
        properties: {
          repoPath: { type: 'string' },
          branch: { type: 'string' },
          subdomainStatic: { type: 'string' },
          subWorkDir: { type: 'string' },
          appName: { type: 'string' },
          buildPath: { type: 'string' },
          stage: { type: 'string' },
          runMode: { type: 'string' }
        },
        required: [
          'repoPath',
          'subdomainStatic',
          'subWorkDir',
          'appName',
          'buildPath',
          'stage',
          'runMode'
        ],
        additionalProperties: false
      },
      user: {
        type: 'object',
        properties: {
          username: { type: 'string' }
        },
        required: ['username'],
        additionalProperties: false
      }
    },
    required: ['project', 'user'],
    additionalProperties: false
  }

  return ajv.compile(schema)(data)
}

program
  .name('euclid-cli')
  .version('0.0.1')
  .requiredOption('-f, --file <file>', 'build config file')
  .addOption(
    new Option('-t, --type <type>', 'config file type').choices(['json', 'yaml']).default('json')
  )

program.parse()

const options = program.opts()

console.log(options)

const { type, file } = options

const configPath = resolve(file)

readFile(configPath, 'utf8', async (err, data) => {
  if (err) throw new Error('Could not read config file')
  const config = JSON.parse(data)
  const valid = validateConfigFile(config)
  if (!valid) throw new Error('Invalid config file')
  const core = new Core()
  const id = await core.clone({
    project: config.project,
    user: config.user
  })
  if (id) {
    const result = await core.run(id)
    console.log(result)
    process.exit(0)
  }
})
