import ora from 'ora';
import chalk from 'chalk';
import s3 from '@auth0/s3';
import OSS from 'ali-oss-extra';
import eachSeries from 'p-each-series';

export enum PublishTo {
  AWS = 'AWS',
  ALI = 'ALI',
}

export type Option = {
  name?: string;
  publishTo: PublishTo;
  accessKeyId: string;
  accessKeySecret: string;
  region?: string;
  bucket: string;
  localPath: string;
  remotePath?: string;
};

type Result = [any, Option | null];

export async function publishTo(options: Option[]) {
  log(`🚀 Start publishing...
    `);
  await eachSeries(options, async (option) => {
    const name = option.name === undefined ? '' : option.name;
    const { localPath, publishTo, bucket, region, remotePath } = option;
    const text = `sync [${localPath}] to [${publishTo}][${bucket}${
      region ? `/${region}` : ''
    }]${remotePath ? `[${remotePath}]` : ''}`;
    const spinner = ora(`${chalk.gray(name)} ${text}`).start();
    let syncFun: typeof SyncToAws | typeof SyncToAli;
    switch (publishTo) {
      case PublishTo.AWS:
        syncFun = SyncToAws;
        break;
      case PublishTo.ALI:
        syncFun = SyncToAli;
        break;
    }
    const result = await syncFun(option);
    if (result[0]) {
      spinner.fail(`${chalk.red(name)} ${text}`);
      log(` ${chalk.red(result[0])}`);
    } else {
      spinner.succeed(`${chalk.green(name)} ${text}`);
    }
  });
  log(``);
  log(`🦄 DONE!
    `);
}

function log(...value: any[]) {
  // eslint-disable-next-line no-console
  console.log(...value);
}
function DEBUG(...value: any[]) {
  //
  value;
}

export function SyncToAws(options: Option): Promise<Result> {
  const client = s3.createClient({
    s3Options: {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.accessKeySecret,
      region: options.region,
    },
  });
  const params = {
    localDir: options.localPath,
    deleteRemoved: true,
    s3Params: {
      Bucket: options.bucket,
      Prefix: options.remotePath,
      ACL: 'public-read',
    },
  };
  const uploader = client.uploadDir(params);
  return new Promise((resolve) => {
    uploader.on('error', function (err: any) {
      resolve([err, null]);
    });
    uploader.on('progress', function () {
      DEBUG(uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function () {
      resolve([null, options]);
    });
  });
}

export async function SyncToAli(options: Option): Promise<Result> {
  const client = new OSS({
    accessKeyId: options.accessKeyId,
    accessKeySecret: options.accessKeySecret,
    region: options.region,
    bucket: options.bucket,
  });
  try {
    DEBUG(await client.deleteDir(options.remotePath));
    DEBUG(await client.syncDir(options.localPath, options.remotePath));
    return [null, options];
  } catch (error) {
    return [error, null];
  }
}
