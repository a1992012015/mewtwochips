import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import Link from "next/link";

import { ILanguage } from "@/types/globals";
import { getTranslation } from "@/app/i18n/server";

interface Props extends ILanguage {}

export async function Clans(props: Props) {
  const { lng } = props;
  const { t } = await getTranslation(lng);
  return (
    <Card className="w-full">
      <Heading align="center">{t("clans.title")}</Heading>

      <Flex gap="3" pt="6" align="center" direction="column" justify="center">
        <Text>{t("clans.empty")}</Text>

        <Link href={"/search?target=players"}>
          <Button>{t("clans.button-text")}</Button>
        </Link>
      </Flex>
    </Card>
  );
}
