import { css, cx } from '@emotion/css';
import React, { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';

import { NavModel, GrafanaTheme2 } from '@grafana/data';
import { useStyles2, CustomScrollbar, useTheme2 } from '@grafana/ui';

import { SectionNavItem } from './SectionNavItem';
import { SectionNavToggle } from './SectionNavToggle';

export interface Props {
  model: NavModel;
}

export function SectionNav({ model }: Props) {
  const styles = useStyles2(getStyles);
  const { isExpanded, onToggleSectionNav } = useSectionNavState();

  if (!Boolean(model.main?.children?.length)) {
    return null;
  }

  return (
    <>
      <nav
        className={cx(styles.nav, {
          [styles.navExpanded]: isExpanded,
        })}
      >
        <CustomScrollbar showScrollIndicators>
          <div className={styles.items} role="tablist">
            <SectionNavItem item={model.main} isSectionRoot />
          </div>
        </CustomScrollbar>
      </nav>
      <SectionNavToggle className={styles.collapseIcon} isExpanded={Boolean(isExpanded)} onClick={onToggleSectionNav} />
    </>
  );
}

function useSectionNavState() {
  const theme = useTheme2();

  const isSmallScreen = window.matchMedia(`(max-width: ${theme.breakpoints.values.lg}px)`).matches;
  const [navExpandedPreference, setNavExpandedPreference] = useLocalStorage<boolean>(
    'grafana.sectionNav.expanded',
    !isSmallScreen
  );
  const [isExpanded, setIsExpanded] = useState(!isSmallScreen && navExpandedPreference);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${theme.breakpoints.values.lg}px)`);
    const onMediaQueryChange = (e: MediaQueryListEvent) => setIsExpanded(e.matches ? false : navExpandedPreference);
    mediaQuery.addEventListener('change', onMediaQueryChange);
    return () => mediaQuery.removeEventListener('change', onMediaQueryChange);
  }, [navExpandedPreference, theme.breakpoints.values.lg]);

  const onToggleSectionNav = () => {
    setNavExpandedPreference(!isExpanded);
    setIsExpanded(!isExpanded);
  };

  return { isExpanded, onToggleSectionNav };
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    nav: css({
      display: 'flex',
      flexDirection: 'column',
      background: theme.colors.background.canvas,
      flexShrink: 0,
      transition: theme.transitions.create(['width', 'max-height']),
      maxHeight: 0,
      [theme.breakpoints.up('md')]: {
        width: 0,
        maxHeight: 'unset',
      },
    }),
    navExpanded: css({
      maxHeight: '50vh',
      [theme.breakpoints.up('md')]: {
        width: '250px',
        maxHeight: 'unset',
      },
    }),
    items: css({
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2, 1, 2, 2),
      minWidth: '250px',
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(4.5, 1, 2, 2),
      },
    }),
    collapseIcon: css({
      border: `1px solid ${theme.colors.border.weak}`,
      left: '50%',
      transform: 'translate(-50%, 50%) rotate(90deg)',
      top: theme.spacing(0),

      [theme.breakpoints.up('md')]: {
        transform: 'translateX(50%)',
        top: theme.spacing(8),
        left: theme.spacing(1),
        right: theme.spacing(-1),
      },
    }),
  };
};
