import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import ScrollSpyContent from 'components/scroll-spy/ScrollSpyContent';

const EventEquipment = ({ equipmentList }) => {
  const { topbarHeight } = useNavContext();

  return (
    <Grid container spacing={{ xs: 4, md: 6, xl: 10 }}>
      <Grid size={{ xs: 12, xl: 6 }}>
        <div>
          <ScrollSpyContent
            id="equipment"
            sx={(theme) => ({
              scrollMarginTop: theme.mixins.topOffset(topbarHeight, 75, true),
            })}
          >
            <Typography variant="h6" sx={{ my: 3, lineHeight: 1.5 }}>
              Equipment
            </Typography>
          </ScrollSpyContent>
          <List sx={{ listStylePosition: 'inside', mb: 3 }} disablePadding>
            {equipmentList.equipment.map((item) => (
              <ListItem
                key={item}
                disablePadding
                sx={{
                  columnGap: 0.7,
                  mb: 1,
                  p: 2,
                  bgcolor: 'background.elevation1',
                }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <IconifyIcon
                    icon="material-symbols:circle"
                    color="background.elevation3"
                    fontSize={8}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  slotProps={{
                    primary: { variant: 'subtitle1', color: 'text.secondary' },
                  }}
                  sx={{ m: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </div>
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Image
          src={equipmentList.image.src}
          alt={equipmentList.image.alt}
          height={584}
          width={600}
          sx={({ mixins }) => ({
            objectFit: 'cover',
            borderRadius: 6,
            width: 1,
            position: 'sticky',
            top: mixins.topOffset(topbarHeight, 75, true),
          })}
        />
      </Grid>
    </Grid>
  );
};

export default EventEquipment;
