/// <reference types="@euclid/common/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    ACCESS_TOKEN?: string
    GIT_WORK_DIR_NAME?: string
    DOMAIN_NAME?: string
  }
}
