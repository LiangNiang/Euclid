import knex, { Knex } from 'knex'

export function initDBInstance() {
  const DB_NAME = process.env.DB_NAME || 'data.sqlite'
  const config: Knex.Config = {
    client: 'better-sqlite3',
    connection: {
      filename: DB_NAME
    },
    useNullAsDefault: true
  }

  return knex(config)
}

export async function initDB(db: Knex) {
  if (!(await db.schema.hasTable('projects'))) {
    await db.schema.createTable('projects', project => {
      project.increments('id')
      project.string('repoPath')
      project.string('branch')
      project.string('dirName')
      project.string('subWorkDir')
      project.string('appName')
      project.string('subdomainStatic')
      project.string('buildPath')
      project.string('stage')
      project.string('runMode')
      project.timestamp('created_at').defaultTo(db.fn.now())
      project.timestamp('updated_at').defaultTo(db.fn.now())
    })
  }
}
