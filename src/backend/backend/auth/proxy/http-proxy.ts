import { HttpsProxyAgent } from 'https-proxy-agent';
import { logInfo } from '../../../logging/logging';
import { envVar } from '../../../logging/utils';

const agent = () => {
    const proxyUri = envVar('HTTP_PROXY', false);
    if (proxyUri) {
        logInfo(`Proxying requests via ${proxyUri} for openid-cilent`);

        return new HttpsProxyAgent(proxyUri);
    } else {
        logInfo(
            `Environment variable HTTP_PROXY is not set, not proxying requests for openid-client`
        );
        return undefined;
    }
};

export default { agent: agent() };
